import { fetchFeedEvents } from "./events-feed-server"
import { createSupabaseAdmin } from "./supabase-admin"
import { isSupabaseConfigured } from "./supabase-config"
import { log } from "./logger"

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
      const supabase = createSupabaseAdmin()
      const { error } = await supabase.from("events").select("id", { count: "exact", head: true })
      result.database = !error
      if (error) {
        log.warn("health.database_probe_failed", { message: error.message })
      }
    } catch (err) {
      log.warn("health.database_probe_exception", {
        message: err instanceof Error ? err.message : String(err),
      })
    }
  }

  try {
    const { events, error } = await fetchFeedEvents()
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
