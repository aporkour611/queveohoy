import type { EventRow } from "../components/types"
import { filterEventsForDisplay } from "./event-crests"
import { eventPriority } from "./featured"

/** Hora mínima (Madrid) para «esta noche» en el widget embed. */
export const EMBED_TONIGHT_MIN_HOUR = 18
export const EMBED_TONIGHT_MAX_ITEMS = 12

function parseEventMinutes(time: string | undefined): number {
  const normalized = (time || "00:00").slice(0, 5)
  const [h, m] = normalized.split(":").map(Number)
  return (h || 0) * 60 + (m || 0)
}

export function pickTonightEvents(
  events: EventRow[],
  todayKey: string,
  minHour = EMBED_TONIGHT_MIN_HOUR,
  limit = EMBED_TONIGHT_MAX_ITEMS
): EventRow[] {
  const minMinutes = minHour * 60

  return filterEventsForDisplay(events)
    .filter((event) => event.date === todayKey)
    .filter((event) => parseEventMinutes(event.time) >= minMinutes)
    .sort((a, b) => {
      const timeDiff =
        parseEventMinutes(a.time) - parseEventMinutes(b.time)
      if (timeDiff !== 0) return timeDiff
      return eventPriority(b) - eventPriority(a)
    })
    .slice(0, limit)
}
