import { createSupabaseAdmin } from "./supabase-admin"
import {
  fetchDestacadosFeedEvents,
  fetchFeedEvents,
  fetchHomeFeedEvents,
  fetchWeekViewFeedEvents,
} from "./events-feed-server"
import { isSupabaseConfigured } from "./supabase-config"
import { siteUrl } from "./seo"

/** Rutas que mantienen calientes ISR, CDN y funciones serverless. */
export const KEEP_WARM_ORIGIN_PATHS = [
  "/api/feed-meta",
  "/api/health",
  "/api/v2/feed",
  "/api/v1/feed/week",
  "/explorar",
  "/futbol",
  "/",
] as const

export type KeepWarmDataResult = {
  home: { count: number; error: string | null }
  destacados: { count: number; error: string | null }
  feed: { count: number; error: string | null }
  week: { count: number; error: string | null }
  database: boolean
  ms: number
}

export type KeepWarmOriginResult = {
  path: string
  ok: boolean
  status: number | null
  ms: number
}

export type KeepWarmCycleResult = {
  data: KeepWarmDataResult
  origins: KeepWarmOriginResult[]
  ok: boolean
  ms: number
}

async function pingDatabase(): Promise<boolean> {
  if (!isSupabaseConfigured()) return true
  try {
    const supabase = createSupabaseAdmin({ fetchTimeoutMs: 5_000 })
    const { error } = await supabase
      .from("events")
      .select("id", { count: "exact", head: true })
    return !error
  } catch {
    return false
  }
}

/** Precalienta unstable_cache + Postgres (evita pausa por inactividad en Supabase). */
export async function warmDataCaches(): Promise<KeepWarmDataResult> {
  const started = Date.now()
  const [home, destacados, feed, week, database] = await Promise.all([
    fetchHomeFeedEvents(),
    fetchDestacadosFeedEvents(),
    fetchFeedEvents(),
    fetchWeekViewFeedEvents(),
    pingDatabase(),
  ])

  return {
    home: { count: home.events.length, error: home.error },
    destacados: { count: destacados.events.length, error: destacados.error },
    feed: { count: feed.events.length, error: feed.error },
    week: { count: week.events.length, error: week.error },
    database,
    ms: Date.now() - started,
  }
}

export async function warmOriginPath(
  path: string,
  baseUrl = siteUrl,
  timeoutMs = 55_000
): Promise<KeepWarmOriginResult> {
  const started = Date.now()
  const url = new URL(path, baseUrl).toString()

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "qvh-keep-warm/1",
        Accept: "text/html,application/json,*/*",
      },
      cache: "no-store",
      signal:
        typeof AbortSignal.timeout === "function"
          ? AbortSignal.timeout(timeoutMs)
          : undefined,
    })

    const ok = res.ok || res.status === 304
    return {
      path,
      ok,
      status: res.status,
      ms: Date.now() - started,
    }
  } catch {
    return {
      path,
      ok: false,
      status: null,
      ms: Date.now() - started,
    }
  }
}

export async function warmOriginRoutes(
  paths: readonly string[] = KEEP_WARM_ORIGIN_PATHS,
  baseUrl = siteUrl
): Promise<KeepWarmOriginResult[]> {
  return Promise.all(paths.map((path) => warmOriginPath(path, baseUrl)))
}

export function keepWarmIsHealthy(data: KeepWarmDataResult): boolean {
  if (!data.database) return false
  if (data.home.error || data.home.count === 0) return false
  if (data.destacados.error || data.destacados.count === 0) return false
  if (data.feed.error || data.feed.count === 0) return false
  return true
}

export async function runKeepWarmCycle(options?: {
  warmOrigins?: boolean
  baseUrl?: string
}): Promise<KeepWarmCycleResult> {
  const started = Date.now()
  const data = await warmDataCaches()
  const origins =
    options?.warmOrigins === false
      ? []
      : await warmOriginRoutes(KEEP_WARM_ORIGIN_PATHS, options?.baseUrl)

  const originsOk = origins.length === 0 || origins.every((o) => o.ok)
  const ok = keepWarmIsHealthy(data) && originsOk

  return {
    data,
    origins,
    ok,
    ms: Date.now() - started,
  }
}
