import type { EventRow } from "../components/types";
import {
  isTopuriaGaethjeFight,
  isUfcWeekEditorialWindow,
  isUfcWeekMainEvent,
  UFC_CASABLANCA_FALLBACK,
} from "./ufc-week";

function eventKey(event: EventRow): string {
  return event.external_id ?? String(event.id);
}

/** Asegura Topuria vs Gaethje en Destacados durante la ventana editorial. */
export function mergeUfcWeekEvents(
  events: EventRow[],
  todayKey: string
): EventRow[] {
  if (!isUfcWeekEditorialWindow(todayKey)) return events;

  const merged = new Map<string, EventRow>();
  for (const event of events) {
    merged.set(eventKey(event), event);
  }

  const hasMain = [...merged.values()].some(
    (event) => isUfcWeekMainEvent(event) || isTopuriaGaethjeFight(event)
  );

  if (!hasMain) {
    merged.set(
      UFC_CASABLANCA_FALLBACK.event.external_id,
      UFC_CASABLANCA_FALLBACK.event
    );
  }

  return [...merged.values()];
}
