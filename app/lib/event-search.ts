import type { EventRow } from "../components/types";
import { eventLabel } from "./seo-events";

function normalizeQuery(query: string): string {
  return query
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function eventSearchText(event: EventRow): string {
  return [
    eventLabel(event),
    event.title,
    event.home_team,
    event.away_team,
    event.competition,
    event.platform,
    event.sport,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function filterEventsByQuery(
  events: EventRow[],
  query: string,
  minLength = 2
): EventRow[] {
  const q = normalizeQuery(query);
  if (q.length < minLength) return [];

  const tokens = q.split(/\s+/).filter(Boolean);
  return events.filter((event) => {
    const haystack = eventSearchText(event);
    return tokens.every((token) => haystack.includes(token));
  });
}
