import type { EventRow } from "../components/types";
import { unstable_cache } from "next/cache";
import { FEED_REVALIDATE_SECONDS } from "./cache-config";
import { FEED_DAY_COUNT, FEED_EVENT_SELECT, normalizeFeedEvents } from "./events-feed";
import { HOME_SSR_DAY_COUNT } from "./home-feed-config";
import { createClient } from "./supabase/server";
import {
  getEventsQueryDateRange,
  getEventsQueryDateRangeTight,
} from "./timezone";

const FEED_QUERY_TIMEOUT_MS = 25_000;

async function queryFeedEvents(dayCount: number, tight: boolean): Promise<{
  events: EventRow[];
  error: string | null;
}> {
  const { from, to } = tight
    ? getEventsQueryDateRangeTight(dayCount)
    : getEventsQueryDateRange(dayCount);
  const supabase = createClient();

  const { data, error } = await supabase
    .from("events")
    .select(FEED_EVENT_SELECT)
    .gte("date", from)
    .lte("date", to)
    .order("date", { ascending: true })
    .order("time", { ascending: true });

  if (error) {
    return { events: [], error: error.message };
  }

  return { events: normalizeFeedEvents(data as EventRow[]), error: null };
}

async function loadFeedEvents(
  dayCount = FEED_DAY_COUNT,
  tight = false
): Promise<{
  events: EventRow[];
  error: string | null;
}> {
  try {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const timeoutPromise = new Promise<{ events: EventRow[]; error: string }>(
      (resolve) => {
        timeoutId = setTimeout(
          () =>
            resolve({
              events: [],
              error:
                "La agenda tardó demasiado en cargar. Reintenta en unos segundos.",
            }),
          FEED_QUERY_TIMEOUT_MS
        );
      }
    );

    const result = await Promise.race([
      queryFeedEvents(dayCount, tight),
      timeoutPromise,
    ]);
    if (timeoutId) clearTimeout(timeoutId);
    return result;
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "No se pudieron cargar los eventos";
    return { events: [], error: message };
  }
}

const getCachedFullFeed = unstable_cache(
  () => loadFeedEvents(FEED_DAY_COUNT, false),
  ["feed-events", "full"],
  { revalidate: FEED_REVALIDATE_SECONDS, tags: ["feed"] }
);

const getCachedHomeFeed = unstable_cache(
  () => loadFeedEvents(HOME_SSR_DAY_COUNT, true),
  ["feed-events", "home", String(HOME_SSR_DAY_COUNT)],
  { revalidate: FEED_REVALIDATE_SECONDS, tags: ["feed"] }
);

/** Feed completo (7 días) — hubs, sitemap, semana completa. */
export async function fetchFeedEvents() {
  return getCachedFullFeed();
}

/** Feed ligero para la home (hoy + mañana). */
export async function fetchHomeFeedEvents() {
  return getCachedHomeFeed();
}
