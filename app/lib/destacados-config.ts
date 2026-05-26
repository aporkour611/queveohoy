import type { EventRow } from "../components/types";
import { parseFootballTeamIds } from "./football";
import { getMadridWeekDates } from "./madrid-time";
import { isSeasonPremiereEvent } from "./tmdb";

export type DestacadoRule = {
  id: string;
  externalId?: string | RegExp;
  /** IDs football-data.org; local/visitante indiferente */
  teamIds?: [string, string];
  teams?: { a: RegExp; b: RegExp };
};

/** Destacados editoriales — añade entradas aquí en el orden deseado */
export const DESTACADOS_RULES: DestacadoRule[] = [
  {
    id: "psg-arsenal",
    teamIds: ["524", "57"],
  },
];

/** Cada nuevo episodio de estas series va a Destacados */
export const DESTACADOS_SERIES_PATTERNS: RegExp[] = [
  /^FROM\b/i,
  /^Euphoria\b/i,
];

function matchesRule(event: EventRow, rule: DestacadoRule): boolean {
  if (rule.externalId) {
    const id = event.external_id ?? "";
    return typeof rule.externalId === "string"
      ? id === rule.externalId
      : rule.externalId.test(id);
  }

  if (rule.teamIds) {
    const ids = parseFootballTeamIds(
      event.external_id,
      event.source,
      event.home_team,
      event.away_team
    );
    if (!ids) return false;
    const [a, b] = rule.teamIds;
    return (
      (ids.homeId === a && ids.awayId === b) ||
      (ids.homeId === b && ids.awayId === a)
    );
  }

  if (rule.teams) {
    const home = (event.home_team ?? "").toLowerCase();
    const away = (event.away_team ?? "").toLowerCase();
    const { a, b } = rule.teams;
    return (
      (a.test(home) && b.test(away)) || (a.test(away) && b.test(home))
    );
  }

  return false;
}

function matchesFollowedSeries(event: EventRow): boolean {
  if (event.sport !== "series") return false;
  const title = event.title ?? "";
  return DESTACADOS_SERIES_PATTERNS.some((pattern) => pattern.test(title));
}

/** Eventos curados para la franja Destacados (orden = reglas + estrenos + series) */
export function pickCuratedDestacados(
  events: EventRow[],
  windowDays = 7
): EventRow[] {
  const week = new Set(getMadridWeekDates(windowDays));
  const inWindow = events.filter((e) => e.date && week.has(e.date));
  const picked: EventRow[] = [];
  const seen = new Set<number>();

  const add = (event: EventRow) => {
    if (seen.has(event.id)) return;
    seen.add(event.id);
    picked.push(event);
  };

  for (const rule of DESTACADOS_RULES) {
    const match = inWindow.find((e) => matchesRule(e, rule));
    if (match) add(match);
  }

  for (const event of inWindow.filter(isSeasonPremiereEvent)) {
    add(event);
  }

  for (const event of inWindow.filter(matchesFollowedSeries)) {
    add(event);
  }

  return picked.sort(
    (a, b) =>
      (a.date ?? "").localeCompare(b.date ?? "") ||
      (a.time ?? "").localeCompare(b.time ?? "")
  );
}

/** Incluye favoritos del usuario en la franja Destacados (sin duplicar) */
export function mergeDestacadosWithFavorites(
  curated: EventRow[],
  favoriteEvents: EventRow[]
): EventRow[] {
  const byId = new Map<number, EventRow>();

  for (const event of favoriteEvents) {
    byId.set(event.id, event);
  }
  for (const event of curated) {
    if (!byId.has(event.id)) byId.set(event.id, event);
  }

  return [...byId.values()].sort(
    (a, b) =>
      (a.date ?? "").localeCompare(b.date ?? "") ||
      (a.time ?? "").localeCompare(b.time ?? "")
  );
}

export { isSeasonPremiereEvent };
