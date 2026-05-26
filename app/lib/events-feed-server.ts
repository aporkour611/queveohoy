import type { EventRow } from "../components/types";
import { unstable_cache } from "next/cache";
import { FEED_REVALIDATE_SECONDS } from "./cache-config";
import { createClient } from "./supabase/server";
import { FEED_DAY_COUNT, FEED_EVENT_SELECT, normalizeFeedEvents } from "./events-feed";
import { getEventsQueryDateRange } from "./timezone";

async function loadFeedEvents(): Promise<{
  events: EventRow[];
  error: string | null;
}> {
  try {
    const { from, to } = getEventsQueryDateRange(FEED_DAY_COUNT);
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
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "No se pudieron cargar los eventos";
    return { events: [], error: message };
  }
}

const getCachedFeedEvents = unstable_cache(
  loadFeedEvents,
  ["feed-events"],
  { revalidate: FEED_REVALIDATE_SECONDS, tags: ["feed"] }
);

export async function fetchFeedEvents() {
  return getCachedFeedEvents();
}
