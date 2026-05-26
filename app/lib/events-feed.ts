import type { EventRow } from "../components/types";
import { dedupeEvents } from "./dedupe-events";
import { filterEventsForDisplay } from "./event-crests";

export const FEED_DAY_COUNT = 7;

/** Columnas necesarias para el feed (menos payload que select *) */
export const FEED_EVENT_SELECT =
  "id,title,date,time,home_team,away_team,competition,platform,sport,external_id,source";

export function normalizeFeedEvents(raw: EventRow[] | null | undefined): EventRow[] {
  return filterEventsForDisplay(dedupeEvents(raw || []) as EventRow[]);
}
