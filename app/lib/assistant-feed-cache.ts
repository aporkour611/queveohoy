import { fetchHomeFeedEvents } from "./events-feed-server"
import type { EventRow } from "../components/types"

type CachedFeed = {
  events: EventRow[]
  error: string | null
  fetchedAt: number
}

let cache: CachedFeed | null = null
const CACHE_MS = 60_000

export async function getAssistantFeedSnapshot(): Promise<{
  events: EventRow[]
  error: string | null
}> {
  const now = Date.now()
  if (cache && now - cache.fetchedAt < CACHE_MS) {
    return { events: cache.events, error: cache.error }
  }

  const { events, error } = await fetchHomeFeedEvents()
  cache = { events, error, fetchedAt: now }
  return { events, error }
}

export function clearAssistantFeedCache(): void {
  cache = null
}
