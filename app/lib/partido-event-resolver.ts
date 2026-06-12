import type { EventRow } from "../components/types";
import { CHAMPIONS_FINAL_FALLBACK } from "./champions-week";
import { mergeCuratedMovieEvents } from "./curated-movie-events";
import { mergeCuratedSeriesEvents } from "./curated-series-events";
import { mergeCuratedSpanishTvEvents } from "./curated-tv-events";
import { mergeUfcWeekEvents } from "./curated-ufc-events";
import { eventSlug, findEventBySlug } from "./event-slug";
import { FEED_DAY_COUNT } from "./events-feed";
import { UFC_CASABLANCA_FALLBACK } from "./ufc-week";

const EDITORIAL_PARTIDO_EVENTS: EventRow[] = [
  UFC_CASABLANCA_FALLBACK.event,
  CHAMPIONS_FINAL_FALLBACK.event,
];

/** Pool de eventos resolvibles por slug (DB + curación + editoriales). */
export function buildPartidoLookupPool(
  dbEvents: EventRow[],
  dateKey: string
): EventRow[] {
  const sameDay = dbEvents.filter((event) => event.date === dateKey);

  const merged = mergeUfcWeekEvents(
    mergeCuratedSpanishTvEvents(
      mergeCuratedSeriesEvents(
        mergeCuratedMovieEvents(sameDay, dateKey),
        dateKey,
        FEED_DAY_COUNT
      ),
      dateKey,
      FEED_DAY_COUNT
    ),
    dateKey
  );

  const pool = new Map<string, EventRow>();

  for (const event of EDITORIAL_PARTIDO_EVENTS) {
    if (event.date !== dateKey) continue;
    pool.set(eventSlug(event), event);
  }

  for (const event of merged) {
    if (event.date !== dateKey) continue;
    pool.set(eventSlug(event), event);
  }

  return [...pool.values()];
}

export function resolveEventBySlugFromPool(
  dbEvents: EventRow[],
  slug: string,
  dateKey: string
): EventRow | null {
  const pool = buildPartidoLookupPool(dbEvents, dateKey);
  return findEventBySlug(pool, slug) ?? null;
}
