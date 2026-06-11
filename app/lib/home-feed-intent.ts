import { prefetchHomeFeedWeekOnce } from "./perf-prefetch";

/** Activa la hidratación del feed interactivo (desde el shell SSR). */
export const HOME_FEED_ACTIVATE_EVENT = "qvh-activate-home-feed";

/** Abrir vista semanal en cuanto hidrate el feed. */
export const HOME_FEED_WEEK_INTENT_KEY = "qvh-home-feed-week-intent";

export const HOME_FEED_WEEK_PREFETCH_URL = "/api/events?scope=week";

export const PUBLIC_WEEK_FEED_PREFETCH_URL = "/api/v1/feed/week";

export function prefetchHomeFeedWeek(): void {
  prefetchHomeFeedWeekOnce();
}

export function markHomeFeedWeekIntent(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(HOME_FEED_WEEK_INTENT_KEY, "1");
  } catch {
    /* ignore */
  }
}

export function consumeHomeFeedWeekIntent(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const pending = sessionStorage.getItem(HOME_FEED_WEEK_INTENT_KEY) === "1";
    if (pending) sessionStorage.removeItem(HOME_FEED_WEEK_INTENT_KEY);
    return pending;
  } catch {
    return false;
  }
}

export function dispatchHomeFeedActivate(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(HOME_FEED_ACTIVATE_EVENT));
}
