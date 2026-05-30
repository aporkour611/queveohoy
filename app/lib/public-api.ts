import type { EventRow } from "../components/types"
import { partidoPath } from "./event-slug"
import { filterEventsForDisplay } from "./event-crests"
import { siteUrl } from "./seo"
import { checkRateLimit, clientIp } from "./rate-limit"

export const PUBLIC_API_VERSION = "1"
export const PUBLIC_API_RATE_LIMIT = 60
export const PUBLIC_API_RATE_WINDOW_MS = 60_000

export type PublicApiEvent = {
  id: number
  title: string
  date: string
  time: string | null
  sport: string | null
  platform: string | null
  competition: string | null
  url: string
}

export type PublicApiFeedResponse = {
  version: typeof PUBLIC_API_VERSION
  generatedAt: string
  timezone: string
  date: string
  count: number
  events: PublicApiEvent[]
  attribution: string
  docs: string
}

export function toPublicApiEvent(event: EventRow): PublicApiEvent | null {
  if (!event.id || !event.date) return null

  const title =
    event.title?.trim() ||
    [event.home_team, event.away_team].filter(Boolean).join(" vs ") ||
    "Evento"

  return {
    id: event.id,
    title,
    date: event.date,
    time: event.time?.slice(0, 5) ?? null,
    sport: event.sport ?? null,
    platform: event.platform ?? null,
    competition: event.competition ?? null,
    url: `${siteUrl}${partidoPath(event)}`,
  }
}

export function toPublicApiEvents(events: EventRow[]): PublicApiEvent[] {
  return filterEventsForDisplay(events)
    .map(toPublicApiEvent)
    .filter((event): event is PublicApiEvent => event !== null)
}

export function filterPublicApiEventsByDate(
  events: EventRow[],
  dateKey: string
): PublicApiEvent[] {
  return toPublicApiEvents(events).filter((event) => event.date === dateKey)
}

export function publicApiCorsHeaders(): HeadersInit {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept",
    "Access-Control-Max-Age": "86400",
  }
}

export function enforcePublicApiRateLimit(
  request: Request
): { ok: true } | { ok: false; retryAfterSec: number } {
  const ip = clientIp(request)
  return checkRateLimit(
    `public-api:${ip}`,
    PUBLIC_API_RATE_LIMIT,
    PUBLIC_API_RATE_WINDOW_MS
  )
}

export function buildPublicApiFeedResponse(
  events: PublicApiEvent[],
  dateKey: string,
  timezone: string
): PublicApiFeedResponse {
  return {
    version: PUBLIC_API_VERSION,
    generatedAt: new Date().toISOString(),
    timezone,
    date: dateKey,
    count: events.length,
    events,
    attribution: "Datos de queveohoy.es — cita la fuente al reutilizar.",
    docs: `${siteUrl}/desarrolladores`,
  }
}
