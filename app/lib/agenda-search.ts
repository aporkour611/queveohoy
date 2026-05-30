import type { EventRow } from "../components/types";

export function normalizeAgendaQuery(raw: string): string {
  return raw.trim().toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
}

function agendaQueryTokens(rawQuery: string): string[] {
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
