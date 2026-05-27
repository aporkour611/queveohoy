import type { EventRow } from "../components/types";
import { parseFootballTeamIds } from "./football";
import { eventPriority } from "./featured";
import {
  isDestacadoFinal,
  isDestacadoPremiere,
} from "./event-card-stamp";
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
  {
    id: "el-drama",
    externalId: "tmdb_movie_1325734",
  },
];

/** Cada nuevo episodio de estas series va a Destacados */
export const DESTACADOS_SERIES_PATTERNS: RegExp[] = [
  /^FROM\b/i,
  /^Euphoria\b/i,
];

const MIN_DESTACADOS_TODAY = 3;
const MAX_DESTACADOS = 10;

export type DestacadosScope = "today" | "week";

export type PickCuratedDestacadosOptions = {
  /** Solo eventos de este día (YYYY-MM-DD en la zona del usuario). */
  todayKey?: string;
  scope?: DestacadosScope;
  windowDays?: number;
};

export { isChampionsFinal, isDestacadoFinal, isDestacadoPremiere } from "./event-card-stamp";

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

function sortTodayItems(a: EventRow, b: EventRow): number {
  return (
    eventPriority(b) - eventPriority(a) ||
    (a.time ?? "").localeCompare(b.time ?? "")
  );
}

function sortWeekAheadItems(a: EventRow, b: EventRow): number {
  return (
    (a.date ?? "").localeCompare(b.date ?? "") ||
    eventPriority(b) - eventPriority(a) ||
    (a.time ?? "").localeCompare(b.time ?? "")
  );
}

/** Eventos curados: hoy a la izquierda; finales/estrenos de la semana siempre a la derecha. */
export function pickCuratedDestacados(
  events: EventRow[],
  options: PickCuratedDestacadosOptions = {}
): EventRow[] {
  const windowDays = options.windowDays ?? 7;
  const today =
    options.todayKey ?? toMadridDateKey(new Date());
  const week = new Set(getMadridWeekDates(windowDays));
  const weekPool = events.filter((e) => e.date && week.has(e.date));
  const todayPool = weekPool.filter((e) => e.date === today);

  const todayItems: EventRow[] = [];
  const weekAheadItems: EventRow[] = [];
  const seen = new Set<number>();

  const addToday = (event: EventRow) => {
    if (seen.has(event.id)) return;
    seen.add(event.id);
    todayItems.push(event);
  };

  const addWeekAhead = (event: EventRow) => {
    if (seen.has(event.id)) return;
    seen.add(event.id);
    weekAheadItems.push(event);
  };

  const routeHighlight = (event: EventRow) => {
    if (!event.date || event.date <= today) addToday(event);
    else addWeekAhead(event);
  };

  for (const rule of DESTACADOS_RULES) {
    const match = weekPool.find((e) => matchesRule(e, rule));
    if (match) routeHighlight(match);
  }

  for (const event of weekPool) {
    if (isDestacadoFinal(event)) routeHighlight(event);
  }

  for (const event of weekPool) {
    if (isDestacadoPremiere(event)) routeHighlight(event);
  }

  for (const event of todayPool) {
    if (seen.has(event.id)) continue;
    if (matchesFlagshipTv(event)) addToday(event);
  }

  for (const event of todayPool) {
    if (seen.has(event.id)) continue;
    if (isSpanishTvFlagship(event)) addToday(event);
  }

  for (const event of todayPool) {
    if (seen.has(event.id)) continue;
    if (isSeasonPremiereEvent(event)) addToday(event);
  }

  for (const event of todayPool) {
    if (seen.has(event.id)) continue;
    if (matchesFollowedSeries(event)) addToday(event);
  }

  if (todayItems.length < MIN_DESTACADOS_TODAY) {
    const candidates = todayPool
      .filter((event) => !seen.has(event.id))
      .sort(sortTodayItems);

    for (const event of candidates) {
      if (todayItems.length >= MIN_DESTACADOS_TODAY) break;
      addToday(event);
    }
  }

  const todaySorted = todayItems.sort(sortTodayItems);
  const weekAheadSorted = weekAheadItems.sort(sortWeekAheadItems);

  const todayCap = Math.max(
    MIN_DESTACADOS_TODAY,
    MAX_DESTACADOS - weekAheadSorted.length
  );
  const todayFinal = todaySorted.slice(0, todayCap);

  return [...todayFinal, ...weekAheadSorted];
}

/** Primer índice de un destacado que no es hoy (para separador visual en el carrusel). */
export function firstWeekAheadDestacadoIndex(
  featured: EventRow[],
  todayKey: string
): number {
  return featured.findIndex((event) => event.date && event.date > todayKey);
}

export { isSeasonPremiereEvent };
