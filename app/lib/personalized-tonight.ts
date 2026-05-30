import type { EventRow } from "../components/types"
import { filterEventsForDisplay } from "./event-crests"
import { eventPriority } from "./featured"
import { eventMatchesUserPlatforms } from "./user-preferences"

export const DEFAULT_PRIME_TIME = "18:00"
export const TONIGHT_FOR_YOU_MAX = 8

function parseEventMinutes(time: string | undefined): number {
  const normalized = (time || "00:00").slice(0, 5)
  const [h, m] = normalized.split(":").map(Number)
  return (h || 0) * 60 + (m || 0)
}

function parsePrimeTimeHour(primeTime: string): number {
  const hour = Number.parseInt(primeTime.slice(0, 2), 10)
  return Number.isFinite(hour) ? hour : 18
}

export function scoreTonightEvent(
  event: EventRow,
  options: {
    userPlatforms: string[]
    favoriteIds: Set<number>
  }
): number {
  let score = eventPriority(event)

  if (options.favoriteIds.has(event.id ?? -1)) score += 120
  if (
    options.userPlatforms.length > 0 &&
    eventMatchesUserPlatforms(event.platform, options.userPlatforms)
  ) {
    score += 80
  }

  const sport = event.sport ?? ""
  if (sport === "football") score += 15
  if (sport === "ufc" || sport === "formula1" || sport === "motogp") score += 10

  return score
}

export function pickPersonalizedTonightEvents(
  events: EventRow[],
  todayKey: string,
  options: {
    primeTime?: string
    userPlatforms?: string[]
    favoriteIds?: number[]
    limit?: number
  } = {}
): EventRow[] {
  const minHour = parsePrimeTimeHour(options.primeTime ?? DEFAULT_PRIME_TIME)
  const minMinutes = minHour * 60
  const userPlatforms = options.userPlatforms ?? []
  const favoriteIds = new Set(options.favoriteIds ?? [])
  const limit = options.limit ?? TONIGHT_FOR_YOU_MAX

  return filterEventsForDisplay(events)
    .filter((event) => event.date === todayKey)
    .filter((event) => parseEventMinutes(event.time) >= minMinutes)
    .sort((a, b) => {
      const scoreDiff =
        scoreTonightEvent(b, { userPlatforms, favoriteIds }) -
        scoreTonightEvent(a, { userPlatforms, favoriteIds })
      if (scoreDiff !== 0) return scoreDiff
      return parseEventMinutes(a.time) - parseEventMinutes(b.time)
    })
    .slice(0, limit)
}

export function filterEventsByUserPlatforms(
  events: EventRow[],
  userPlatforms: string[]
): EventRow[] {
  if (!userPlatforms.length) return events
  return events.filter((event) =>
    eventMatchesUserPlatforms(event.platform, userPlatforms)
  )
}
