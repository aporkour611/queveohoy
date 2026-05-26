import type { EventRow } from "../components/types";
import { madridDateTimeToUtc } from "./madrid-time";

export function eventLabel(event: EventRow): string {
  if (event.home_team && event.away_team) {
    return `${event.home_team} vs ${event.away_team}`;
  }
  return event.title?.trim() || "Evento";
}

export function schemaEventType(
  sport?: string | null
): "SportsEvent" | "BroadcastEvent" {
  if (sport === "cine" || sport === "series" || sport === "tv") {
    return "BroadcastEvent";
  }
  return "SportsEvent";
}

/** ISO 8601 UTC equivalente a la fecha/hora en Madrid (válido para schema.org). */
export function eventStartIso(date?: string, time?: string): string | undefined {
  if (!date) return undefined;
  const t = (time || "12:00").slice(0, 5);
  return madridDateTimeToUtc(date, t).toISOString();
}

export function eventMetaParts(event: EventRow): string[] {
  return [
    event.competition?.split(" · ")[0] ?? null,
    event.platform?.split(",")[0]?.trim() ?? null,
  ].filter(Boolean) as string[];
}
