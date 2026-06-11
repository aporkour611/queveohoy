import { createSupabaseAdmin } from "./supabase-admin"
import { isSupabaseConfigured } from "./supabase-config"
import { log } from "./logger"
import { raceWithTimeout } from "./race-with-timeout"
import { getMadridTodayKey } from "./seo-date"
import { addDaysToDateKey } from "./madrid-time"

const HEALTH_DB_PROBE_MS = 4_000
const HEALTH_FEED_PROBE_MS = 5_000

export type HealthProbeResult = {
  database: boolean
  feed: boolean
  feedEventCount: number
  feedError: string | null
}

/** Comprueba que hay eventos en la ventana de la agenda (sin cargar el feed completo). */
async function probeFeedEventCount(): Promise<{
  count: number
  error: string | null
}> {
  if (!isSupabaseConfigured()) {
    return { count: 0, error: null }
  }

  const today = getMadridTodayKey()
  const to = addDaysToDateKey(today, 7)

  try {
    const supabase = createSupabaseAdmin({ fetchTimeoutMs: HEALTH_FEED_PROBE_MS })
    const { count, error } = await supabase
      .from("events")
      .select("id", { count: "exact", head: true })
      .gte("date", today)
      .lte("date", to)

    if (error) {
      return { count: 0, error: error.message }
    }

    return { count: count ?? 0, error: null }
  } catch (err) {
    return {
      count: 0,
      error: err instanceof Error ? err.message : String(err),
    }
  }
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
      probeFeedEventCount(),
      HEALTH_FEED_PROBE_MS,
      () => ({ count: 0, error: "health feed probe timeout" })
    )
    result.feedEventCount = feedResult.count
    result.feedError = feedResult.error
    result.feed = !feedResult.error && feedResult.count > 0
    if (feedResult.error) {
      log.warn("health.feed_probe_failed", { message: feedResult.error })
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
