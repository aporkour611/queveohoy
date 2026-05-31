import { fetchFeedEvents } from "./events-feed-server"
import { createSupabaseAdmin } from "./supabase-admin"
import { isSupabaseConfigured } from "./supabase-config"
import { log } from "./logger"
import { raceWithTimeout } from "./race-with-timeout"

const HEALTH_DB_PROBE_MS = 4_000
const HEALTH_FEED_PROBE_MS = 8_000

export type HealthProbeResult = {
  database: boolean
  feed: boolean
  feedEventCount: number
  feedError: string | null
}

export async function runHealthProbes(): Promise<HealthProbeResult> {
  const result: HealthProbeResult = {
    database: false,
    feed: false,
    feedEventCount: 0,
    feedError: null,
  }

  if (isSupabaseConfigured()) {
    try {
      result.database = await raceWithTimeout(
        (async () => {
          const supabase = createSupabaseAdmin({ fetchTimeoutMs: HEALTH_DB_PROBE_MS })
          const { error } = await supabase
            .from("events")
            .select("id", { count: "exact", head: true })
          if (error) {
            log.warn("health.database_probe_failed", { message: error.message })
            return false
          }
          return true
        })(),
        HEALTH_DB_PROBE_MS,
        () => {
          log.warn("health.database_probe_timeout", { ms: HEALTH_DB_PROBE_MS })
          return false
        }
      )
    } catch (err) {
      log.warn("health.database_probe_exception", {
        message: err instanceof Error ? err.message : String(err),
      })
    }
  }

  try {
    const feedResult = await raceWithTimeout(
      fetchFeedEvents(),
      HEALTH_FEED_PROBE_MS,
      () => ({
        events: [] as Awaited<ReturnType<typeof fetchFeedEvents>>["events"],
        error: "health feed probe timeout",
      })
    )
    const { events, error } = feedResult
    result.feedEventCount = events.length
    result.feedError = error
    result.feed = !error && events.length > 0
    if (error) {
      log.warn("health.feed_probe_failed", { message: error })
    }
  } catch (err) {
    result.feedError = err instanceof Error ? err.message : String(err)
    log.warn("health.feed_probe_exception", { message: result.feedError })
  }

  return result
}

export function healthIsReady(probes: HealthProbeResult): boolean {
  if (!isSupabaseConfigured()) return true
  if (!probes.database) return false
  if (probes.feedError) return false
  return probes.feedEventCount > 0
}
