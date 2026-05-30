import { HOME_FEED_WEEK_PREFETCH_URL } from "./home-feed-intent"

let weekFeedPrefetched = false
let weekFeedPrefetchedAt = 0
const WEEK_PREFETCH_TTL_MS = 30_000

/** Una sola petición de prefetch del feed semanal por sesión de página. */
export function prefetchHomeFeedWeekOnce(): void {
  if (typeof window === "undefined") return
  const now = Date.now()
  if (weekFeedPrefetched && now - weekFeedPrefetchedAt < WEEK_PREFETCH_TTL_MS) return
  weekFeedPrefetched = true
  weekFeedPrefetchedAt = now

  try {
    void fetch(HOME_FEED_WEEK_PREFETCH_URL, {
      priority: "low",
      credentials: "same-origin",
    })
  } catch {
    weekFeedPrefetched = false
  }
}

export function resetWeekFeedPrefetchForTests(): void {
  weekFeedPrefetched = false
  weekFeedPrefetchedAt = 0
}
