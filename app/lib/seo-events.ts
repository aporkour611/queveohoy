import type { EventRow } from "../components/types";

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

/** ISO 8601 para schema.org (hora local Madrid, sin conversión costosa). */
export function eventStartIso(date?: string, time?: string): string | undefined {
  if (!date) return undefined;
  const t = (time || "12:00").slice(0, 5);
  return `${date}T${t}:00`;
}

export function eventMetaParts(event: EventRow): string[] {
  return [
    event.competition?.split(" · ")[0] ?? null,
    event.platform?.split(",")[0]?.trim() ?? null,
  ].filter(Boolean) as string[];
}
