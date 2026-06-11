import { FEED_REVALIDATE_SECONDS } from "./cache-config"
import type { EventRow } from "../components/types"
import { getMadridTodayKey } from "./seo-date"
import { MADRID_TZ } from "./timezone"

export type FeedMetaPayload = {
  generatedAt: string
  timezone: string
  date: string
  eventCount: number
  todayCount: number
  weekCount: number
  revalidateSeconds: number
  error: string | null
}

export function buildFeedMetaPayload(input: {
  events: EventRow[]
  weekEvents: EventRow[]
  feedError?: string | null
  weekError?: string | null
  generatedAt?: string
}): FeedMetaPayload {
  const todayKey = getMadridTodayKey()
  const todayCount = input.events.filter((event) => event.date === todayKey).length

  return {
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    timezone: MADRID_TZ,
    date: todayKey,
    eventCount: input.events.length,
    todayCount,
    weekCount: input.weekEvents.length,
    revalidateSeconds: FEED_REVALIDATE_SECONDS,
    error: input.feedError ?? input.weekError ?? null,
  }
}
