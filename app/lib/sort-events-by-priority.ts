import type { EventRow } from "../components/types";
import { eventPriority } from "./featured";
import { isTvFictionSeriesEvent } from "./tv-show-category";

/** Orden cronológico de izquierda a derecha (fecha + hora Madrid). */
export function sortEventsChronologically(events: EventRow[]): EventRow[] {
  return [...events].sort(
    (a, b) =>
      (a.date ?? "").localeCompare(b.date ?? "") ||
      (a.time ?? "99:99").localeCompare(b.time ?? "99:99") ||
      (a.title ?? "").localeCompare(b.title ?? "", "es")
  );
}

/** Ordena eventos por relevancia editorial (más populares primero). */
export function sortEventsByPopularity(events: EventRow[]): EventRow[] {
  return [...events].sort(
    (a, b) =>
      eventPriority(b) - eventPriority(a) ||
      (a.time ?? "").localeCompare(b.time ?? "") ||
      (a.title ?? "").localeCompare(b.title ?? "", "es")
  );
}

/** Series TMDB/streaming primero; telenovelas TV lineal al final del carril (más a la derecha). */
export function sortSeriesCatalogEvents(events: EventRow[]): EventRow[] {
  const streaming: EventRow[] = [];
  const tvFiction: EventRow[] = [];

  for (const event of events) {
    if (isTvFictionSeriesEvent(event)) tvFiction.push(event);
    else streaming.push(event);
  }

  return [
    ...sortEventsByPopularity(streaming),
    ...sortEventsByPopularity(tvFiction),
  ];
}
