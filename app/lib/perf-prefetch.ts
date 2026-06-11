import {
  HOME_FEED_WEEK_PREFETCH_URL,
  PUBLIC_WEEK_FEED_PREFETCH_URL,
} from "./home-feed-intent"
import { warmClientFeedUrl } from "./client-fetch-json"

let weekFeedPrefetched = false
let weekFeedPrefetchedAt = 0
const WEEK_PREFETCH_TTL_MS = 300_000

/** Prefetch del API week público (apps / explorar). */
export function prefetchPublicWeekFeedOnce(): void {
  if (typeof window === "undefined") return
  try {
    void warmClientFeedUrl(PUBLIC_WEEK_FEED_PREFETCH_URL)
  } catch {
    /* ignore */
  }
}

/**
 * Calienta el feed semanal sin duplicar descargas: ETag + TTL 5 min.
 * El `<link rel="prefetch">` en home ya calienta CDN; esto revalida barato.
 */
export function prefetchHomeFeedWeekOnce(): void {
  if (typeof window === "undefined") return
  const now = Date.now()
  if (weekFeedPrefetched && now - weekFeedPrefetchedAt < WEEK_PREFETCH_TTL_MS) return
  weekFeedPrefetched = true
  weekFeedPrefetchedAt = now

  try {
    void warmClientFeedUrl(HOME_FEED_WEEK_PREFETCH_URL)
  } catch {
    weekFeedPrefetched = false
  }
}

export function resetWeekFeedPrefetchForTests(): void {
  weekFeedPrefetched = false
  weekFeedPrefetchedAt = 0
}
