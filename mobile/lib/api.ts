import { ensureHttpsOrigin } from "./ensure-https"

export type FeedEvent = {
  id: number
  title: string
  date: string
  time?: string | null
  sport?: string | null
  competition?: string | null
  platform?: string | null
}

export type FeedResponse = {
  version: string
  generatedAt: string
  timezone: string
  date: string
  count: number
  events: FeedEvent[]
  error?: string | null
}

export const API_BASE = ensureHttpsOrigin(
  process.env.EXPO_PUBLIC_API_BASE,
  "https://queveohoy.es"
)

export const SITE_URL = API_BASE

function madridTodayKey(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
  }).format(new Date())
}

function addDays(dateKey: string, days: number): string {
  const [y, m, d] = dateKey.split("-").map(Number)
  const date = new Date(Date.UTC(y, m - 1, d + days))
  return date.toISOString().slice(0, 10)
}

export async function fetchFeedByDate(
  date: string,
  limit = 50
): Promise<FeedResponse> {
  const url = `${API_BASE}/api/v1/feed?date=${encodeURIComponent(date)}&limit=${limit}`
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
  })

  if (!res.ok) {
    throw new Error(`Feed HTTP ${res.status}`)
  }

  return res.json() as Promise<FeedResponse>
}

export async function fetchTodayFeed(limit = 50): Promise<FeedResponse> {
  return fetchFeedByDate(madridTodayKey(), limit)
}

export async function fetchWeekFeed(days = 7): Promise<{
  days: { date: string; events: FeedEvent[] }[]
  error: string | null
}> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/feed/week`, {
      headers: { Accept: "application/json" },
    })
    if (res.ok) {
      const body = (await res.json()) as {
        events?: FeedEvent[]
        date?: string
        error?: string
      }
      if (body.events?.length) {
        const grouped = new Map<string, FeedEvent[]>()
        for (const event of body.events) {
          const list = grouped.get(event.date) ?? []
          list.push(event)
          grouped.set(event.date, list)
        }
        const days = [...grouped.entries()]
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, events]) => ({ date, events }))
        return { days, error: body.error ?? null }
      }
    }
  } catch {
    /* fallback below */
  }

  const today = madridTodayKey()
  const dates = Array.from({ length: days }, (_, i) => addDays(today, i))

  const results = await Promise.allSettled(
    dates.map((date) => fetchFeedByDate(date, 30))
  )

  const out: { date: string; events: FeedEvent[] }[] = []
  let error: string | null = null

  results.forEach((result, index) => {
    const date = dates[index]!
    if (result.status === "fulfilled") {
      if (result.value.events.length > 0) {
        out.push({ date, events: result.value.events })
      }
      if (result.value.error) error = result.value.error
    } else {
      error = result.reason instanceof Error ? result.reason.message : "Error de red"
    }
  })

  return { days: out, error }
}

export function formatEventMeta(event: FeedEvent): string {
  const parts = [event.time, event.platform, event.competition].filter(Boolean)
  return parts.join(" · ")
}

export function formatDayTitle(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })
}
