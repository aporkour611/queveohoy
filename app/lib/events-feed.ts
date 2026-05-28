import type { EventRow } from "../components/types";
import { filterBlockedSports } from "./blocked-sports";
import { dedupeEvents } from "./dedupe-events";
import { filterEventsForDisplay } from "./event-crests";
import { isSpainLatamRelevantMediaEvent } from "./spain-latam-media";

export const FEED_DAY_COUNT = 7;

/** Columnas necesarias para el feed (menos payload que select *) */
export const FEED_EVENT_SELECT =
  "id,title,date,time,home_team,away_team,competition,platform,sport,external_id,source";

export function normalizeFeedEvents(raw: EventRow[] | null | undefined): EventRow[] {
  return filterBlockedSports(
    filterEventsForDisplay(dedupeEvents(raw || []) as EventRow[])
  ).filter(isSpainLatamRelevantMediaEvent);
}
