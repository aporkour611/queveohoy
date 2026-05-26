import type { EventRow } from "../components/types";
import { cache } from "react";
import { createClient } from "./supabase/server";
import { FEED_DAY_COUNT, normalizeFeedEvents } from "./events-feed";
import { getEventsQueryDateRange } from "./timezone";

async function loadFeedEvents(): Promise<{
  events: EventRow[];
  error: string | null;
}> {
  try {
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
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "No se pudieron cargar los eventos";
    return { events: [], error: message };
  }
}

export const fetchFeedEvents = cache(loadFeedEvents);
