import type { EventRow } from "../components/types";
import { dedupeEvents } from "./dedupe-events";
import { filterEventsForDisplay } from "./event-crests";

export const FEED_DAY_COUNT = 7;

export function normalizeFeedEvents(raw: EventRow[] | null | undefined): EventRow[] {
  return filterEventsForDisplay(dedupeEvents(raw || []) as EventRow[]).filter(
    (event) => event.sport !== "dota2"
  );
}
