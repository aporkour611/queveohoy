import type { EventRow } from "../components/types";

export function normalizeAgendaQuery(raw: string): string {
  return raw.trim().toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
}

export function eventMatchesAgendaQuery(
  event: EventRow,
  rawQuery: string
): boolean {
  const query = normalizeAgendaQuery(rawQuery);
  if (!query) return true;

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

  return haystack.includes(query);
}

export function filterEventsByAgendaQuery(
  events: EventRow[],
  rawQuery: string
): EventRow[] {
  const query = normalizeAgendaQuery(rawQuery);
  if (!query) return events;
  return events.filter((event) => eventMatchesAgendaQuery(event, query));
}
