import type { EventRow } from "../components/types";
import { parseFootballTeamIds } from "./football";
import { eventPriority } from "./featured";
import { getMadridWeekDates, toMadridDateKey } from "./madrid-time";
import {
  isSpanishTvFlagship,
  SPANISH_TV_TITLE_PATTERNS,
} from "./spanish-tv-curated";
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

const MIN_DESTACADOS = 5;
const MAX_DESTACADOS = 10;

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

function matchesFlagshipTv(event: EventRow): boolean {
  if (event.sport !== "tv") return false;
  const blob = `${event.title ?? ""} ${event.competition ?? ""}`;
  return SPANISH_TV_TITLE_PATTERNS.some((pattern) => pattern.test(blob));
}

/** Eventos curados para la franja Destacados (orden = reglas + TV + estrenos + autocompletado) */
export function pickCuratedDestacados(
  events: EventRow[],
  windowDays = 7
): EventRow[] {
  const week = new Set(getMadridWeekDates(windowDays));
  const today = toMadridDateKey(new Date());
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

  for (const event of inWindow.filter(matchesFlagshipTv)) {
    add(event);
  }

  for (const event of inWindow.filter(isSpanishTvFlagship)) {
    add(event);
  }

  for (const event of inWindow.filter(isSeasonPremiereEvent)) {
    add(event);
  }

  for (const event of inWindow.filter(matchesFollowedSeries)) {
    add(event);
  }

  if (picked.length < MIN_DESTACADOS) {
    const candidates = inWindow
      .filter((event) => !seen.has(event.id))
      .sort((a, b) => {
        const scoreA = eventPriority(a) + (a.date === today ? 20 : 0);
        const scoreB = eventPriority(b) + (b.date === today ? 20 : 0);
        return (
          scoreB - scoreA || (a.time ?? "").localeCompare(b.time ?? "")
        );
      });

    for (const event of candidates) {
      if (picked.length >= MAX_DESTACADOS) break;
      add(event);
    }
  }

  return picked.sort(
    (a, b) =>
      eventPriority(b) - eventPriority(a) ||
      (a.date ?? "").localeCompare(b.date ?? "") ||
      (a.time ?? "").localeCompare(b.time ?? "")
  );
}

export { isSeasonPremiereEvent };
