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

export async function fetchTodayFeed(limit = 40): Promise<FeedResponse> {
  const url = `${API_BASE}/api/v1/feed?limit=${limit}`
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
  })

  if (!res.ok) {
    throw new Error(`Feed HTTP ${res.status}`)
  }

  return res.json() as Promise<FeedResponse>
}

export function formatEventMeta(event: FeedEvent): string {
  const parts = [event.time, event.platform, event.competition].filter(Boolean)
  return parts.join(" · ")
}
