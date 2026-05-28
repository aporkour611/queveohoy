import type { EventRow } from "../components/types";
import { eventPriority } from "./featured";

/** Ordena eventos por relevancia editorial (más populares primero). */
export function sortEventsByPopularity(events: EventRow[]): EventRow[] {
  return [...events].sort(
    (a, b) =>
      eventPriority(b) - eventPriority(a) ||
      (a.time ?? "").localeCompare(b.time ?? "") ||
      (a.title ?? "").localeCompare(b.title ?? "", "es")
  );
}
