import type { EventRow } from "../components/types";
import { createClient } from "./supabase/server";
import { FEED_DAY_COUNT, normalizeFeedEvents } from "./events-feed";
import { getEventsQueryDateRange } from "./timezone";

export async function fetchFeedEvents(): Promise<{
  events: EventRow[];
  error: string | null;
}> {
  const { from, to } = getEventsQueryDateRange(FEED_DAY_COUNT);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .gte("date", from)
    .lte("date", to)
    .order("date", { ascending: true })
    .order("time", { ascending: true });

  if (error) {
    return { events: [], error: error.message };
  }

  return { events: normalizeFeedEvents(data as EventRow[]), error: null };
}
