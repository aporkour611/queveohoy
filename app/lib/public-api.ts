import type { EventRow } from "../components/types"
import { partidoPath } from "./event-slug"
import { filterEventsForDisplay } from "./event-crests"
import { ALL_SPORT_IDS } from "./filter-config"
import { siteUrl } from "./seo"
import { checkRateLimit, clientIp } from "./rate-limit"
import { checkRateLimitDistributed } from "./rate-limit-distributed"
import { eventMatchesSportFilters } from "./tv-show-category"

export const PUBLIC_API_VERSION = "1"
export const PUBLIC_API_MINOR_VERSION = "1.1"
export const PUBLIC_API_V2_VERSION = "2"
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
  /** Presente cuando se usa filtro `categories` (extensión v1.1). */
  apiMinorVersion?: typeof PUBLIC_API_MINOR_VERSION
  generatedAt: string
  timezone: string
  date: string
  count: number
  events: PublicApiEvent[]
  nextCursor: string | null
  /** Categorías aplicadas en la petición (v1.1). */
  categoriesApplied?: string[]
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
    "Access-Control-Allow-Headers":
      "Content-Type, Accept, X-API-Key, Authorization",
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

export async function enforcePublicApiRateLimitAsync(
  request: Request
): Promise<{ ok: true } | { ok: false; retryAfterSec: number }> {
  const ip = clientIp(request)
  return checkRateLimitDistributed(
    `public-api:${ip}`,
    PUBLIC_API_RATE_LIMIT,
    PUBLIC_API_RATE_WINDOW_MS
  )
}

export function parsePublicApiCategories(
  raw: string | null | undefined
): string[] {
  if (!raw?.trim()) return []

  const valid = new Set(ALL_SPORT_IDS)
  return [
    ...new Set(
      raw
        .split(",")
        .map((part) => part.trim().toLowerCase())
        .filter((id) => valid.has(id))
    ),
  ]
}

export function filterPublicApiEventsByCategories(
  events: EventRow[],
  categories: string[]
): PublicApiEvent[] {
  if (categories.length === 0) return toPublicApiEvents(events)
  return toPublicApiEvents(events).filter((event) => {
    const row = events.find((e) => e.id === event.id)
    if (!row) return false
    return eventMatchesSportFilters(row, categories)
  })
}

export function buildPublicApiFeedResponse(
  events: PublicApiEvent[],
  dateKey: string,
  timezone: string,
  nextCursor: string | null = null,
  categoriesApplied?: string[]
): PublicApiFeedResponse {
  const hasCategories =
    categoriesApplied != null && categoriesApplied.length > 0

  return {
    version: PUBLIC_API_VERSION,
    ...(hasCategories
      ? {
          apiMinorVersion: PUBLIC_API_MINOR_VERSION,
          categoriesApplied,
        }
      : {}),
    generatedAt: new Date().toISOString(),
    timezone,
    date: dateKey,
    count: events.length,
    events,
    nextCursor,
    attribution: "Datos de queveohoy.es — cita la fuente al reutilizar.",
    docs: `${siteUrl}/desarrolladores`,
  }
}

const DEFAULT_PAGE_SIZE = 50
const MAX_PAGE_SIZE = 100

export function parsePublicApiPageSize(raw: string | null): number {
  const parsed = Number.parseInt(raw ?? "", 10)
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_PAGE_SIZE
  return Math.min(parsed, MAX_PAGE_SIZE)
}

export function encodePublicApiCursor(eventId: number): string {
  return Buffer.from(String(eventId), "utf8").toString("base64url")
}

export function decodePublicApiCursor(raw: string | null): number | null {
  if (!raw?.trim()) return null
  try {
    const decoded = Buffer.from(raw, "base64url").toString("utf8")
    const id = Number.parseInt(decoded, 10)
    return Number.isFinite(id) && id > 0 ? id : null
  } catch {
    return null
  }
}

export function paginatePublicApiEvents(
  events: PublicApiEvent[],
  options: { limit?: number; cursor?: string | null } = {}
): { events: PublicApiEvent[]; nextCursor: string | null } {
  const limit = options.limit ?? DEFAULT_PAGE_SIZE
  const afterId = decodePublicApiCursor(options.cursor ?? null)
  const sorted = [...events].sort((a, b) => {
    const dateCmp = a.date.localeCompare(b.date)
    if (dateCmp !== 0) return dateCmp
    const timeCmp = (a.time ?? "").localeCompare(b.time ?? "")
    if (timeCmp !== 0) return timeCmp
    return a.id - b.id
  })

  const startIndex =
    afterId == null
      ? 0
      : sorted.findIndex((event) => event.id === afterId) + 1

  const slice = sorted.slice(Math.max(0, startIndex), Math.max(0, startIndex) + limit)
  const last = slice[slice.length - 1]
  const hasMore =
    slice.length === limit &&
    sorted.length > Math.max(0, startIndex) + slice.length

  return {
    events: slice,
    nextCursor: hasMore && last ? encodePublicApiCursor(last.id) : null,
  }
}

export type PublicApiV2FeedResponse = Omit<PublicApiFeedResponse, "version"> & {
  version: typeof PUBLIC_API_V2_VERSION
  etag: string
  scopes: string[]
  /** Presente si la petición usa una clave partner válida. */
  partner?: { id: string; label: string; tier: "partner" }
  rateLimit?: { limit: number; windowSec: number }
}

export function buildPublicApiV2FeedResponse(
  events: PublicApiEvent[],
  dateKey: string,
  timezone: string,
  nextCursor: string | null = null,
  categoriesApplied?: string[],
  partner?: { id: string; label: string },
  rateLimit?: { limit: number; windowSec: number }
): PublicApiV2FeedResponse {
  const base = buildPublicApiFeedResponse(
    events,
    dateKey,
    timezone,
    nextCursor,
    categoriesApplied
  )
  const payload = JSON.stringify({ date: dateKey, count: events.length, ids: events.map((e) => e.id) })
  const etag = `"${Buffer.from(payload).toString("base64url").slice(0, 32)}"`

  return {
    ...base,
    version: PUBLIC_API_V2_VERSION,
    etag,
    scopes: ["day", "categories", "cursor", ...(partner ? ["partner"] : [])],
    ...(partner
      ? {
          partner: { ...partner, tier: "partner" as const },
          rateLimit: rateLimit ?? {
            limit: 300,
            windowSec: PUBLIC_API_RATE_WINDOW_MS / 1000,
          },
        }
      : {}),
  }
}
