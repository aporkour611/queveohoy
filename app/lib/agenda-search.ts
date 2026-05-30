import type { EventRow } from "../components/types";
import {
  normalizeAgendaQuery,
  parseNaturalAgendaQuery,
} from "./agenda-search-nl";

export { normalizeAgendaQuery } from "./agenda-search-nl";

function agendaQueryTokens(rawQuery: string): string[] {
  const parsed = parseNaturalAgendaQuery(rawQuery);
  if (parsed.tokens.length > 0) return parsed.tokens;
  const query = normalizeAgendaQuery(rawQuery);
  if (!query) return [];
  return query.split(/\s+/).filter(Boolean);
}

export function eventMatchesAgendaQuery(
  event: EventRow,
  rawQuery: string
): boolean {
  const tokens = agendaQueryTokens(rawQuery);
  if (!tokens.length) return true;

  const haystack = normalizeAgendaQuery(
    [
      event.title,
      event.home_team,
      event.away_team,
      event.competition,
      event.platform,
      event.sport,
    ]
      .filter(Boolean)
      .join(" ")
  );

  return tokens.every((token) => haystack.includes(token));
}

export function filterEventsByAgendaQuery(
  events: EventRow[],
  rawQuery: string
): EventRow[] {
  const query = normalizeAgendaQuery(rawQuery);
  if (!query) return events;
  return events.filter((event) => eventMatchesAgendaQuery(event, query));
}
