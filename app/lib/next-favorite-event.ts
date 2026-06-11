import type { EventRow } from "../components/types"
import { madridDateTimeToUtc } from "./madrid-time"

export type NextFavoriteSnapshot = {
  id: number
  title: string
  date: string
  time: string | null
  sport: string | null
  startsAt: string
}

function eventStartUtc(event: Pick<EventRow, "date" | "time">): Date | null {
  if (!event.date) return null
  const time = event.time?.trim() || "12:00"
  return madridDateTimeToUtc(event.date, time)
}

export function pickNextFavoriteEvent(
  events: EventRow[],
  now = new Date()
): NextFavoriteSnapshot | null {
  let best: { event: EventRow; start: Date } | null = null

  for (const event of events) {
    const start = eventStartUtc(event)
    if (!start) continue
    if (start.getTime() < now.getTime()) continue
    if (!best || start.getTime() < best.start.getTime()) {
      best = { event, start }
    }
  }

  if (!best) return null

  return {
    id: best.event.id,
    title: best.event.title?.trim() || "Evento",
    date: best.event.date ?? "",
    time: best.event.time ?? null,
    sport: best.event.sport ?? null,
    startsAt: best.start.toISOString(),
  }
}
