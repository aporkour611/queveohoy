import { HOME_FEED_WEEK_PREFETCH_URL } from "./home-feed-intent"

let weekFeedPrefetched = false

/** Una sola petición de prefetch del feed semanal por sesión de página. */
export function prefetchHomeFeedWeekOnce(): void {
  if (weekFeedPrefetched || typeof window === "undefined") return
  weekFeedPrefetched = true

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
}
