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

const MIN_DESTACADOS_WEEK = 5;
const MIN_DESTACADOS_TODAY = 3;
const MAX_DESTACADOS = 10;

export type DestacadosScope = "today" | "week";

export type PickCuratedDestacadosOptions = {
  /** Solo eventos de este día (YYYY-MM-DD en la zona del usuario). */
  todayKey?: string;
  scope?: DestacadosScope;
  windowDays?: number;
};

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
  options: PickCuratedDestacadosOptions = {}
): EventRow[] {
  const scope = options.scope ?? "today";
  const windowDays = options.windowDays ?? 7;
  const today =
    options.todayKey ?? toMadridDateKey(new Date());
  const week = new Set(getMadridWeekDates(windowDays));
  const inWindow = events.filter((e) => e.date && week.has(e.date));
  const pool =
    scope === "today"
      ? inWindow.filter((e) => e.date === today)
      : inWindow;
  const minDestacados =
    scope === "today" ? MIN_DESTACADOS_TODAY : MIN_DESTACADOS_WEEK;
  const picked: EventRow[] = [];
  const seen = new Set<number>();

  const add = (event: EventRow) => {
    if (seen.has(event.id)) return;
    seen.add(event.id);
    picked.push(event);
  };

  for (const rule of DESTACADOS_RULES) {
    const match = pool.find((e) => matchesRule(e, rule));
    if (match) add(match);
  }

  for (const event of pool.filter(matchesFlagshipTv)) {
    add(event);
  }

  for (const event of pool.filter(isSpanishTvFlagship)) {
    add(event);
  }

  for (const event of pool.filter(isSeasonPremiereEvent)) {
    add(event);
  }

  for (const event of pool.filter(matchesFollowedSeries)) {
    add(event);
  }

  if (picked.length < minDestacados) {
    const candidates = pool
      .filter((event) => !seen.has(event.id))
      .sort((a, b) => {
        const scoreA =
          eventPriority(a) + (scope === "week" && a.date === today ? 20 : 0);
        const scoreB =
          eventPriority(b) + (scope === "week" && b.date === today ? 20 : 0);
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
