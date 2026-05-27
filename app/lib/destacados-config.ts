import type { EventRow } from "../components/types";
import { parseFootballTeamIds } from "./football";
import { eventPriority } from "./featured";
import {
  isDestacadoFinal,
  isDestacadoPremiere,
} from "./event-card-stamp";
import { addDaysToDateKey, getMadridWeekDates, toMadridDateKey } from "./madrid-time";
import {
  curatedMovieByExternalId,
  isCuratedMovieEvent,
} from "./movies-curated";
import {
  isSpanishTvFlagship,
  SPANISH_TV_TITLE_PATTERNS,
} from "./spanish-tv-curated";
import { isSeasonPremiereEvent } from "./tmdb";

export type DestacadoRule = {
  id: string;
  externalId?: string | RegExp;
  titleMatch?: RegExp;
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
    titleMatch: /^(the\s+)?drama\b|^el\s+drama\b/i,
  },
];

/** Cada nuevo episodio de estas series va a Destacados */
export const DESTACADOS_SERIES_PATTERNS: RegExp[] = [
  /^FROM\b/i,
  /^Euphoria\b/i,
];

const MIN_DESTACADOS_TODAY = 3;
const MAX_DESTACADOS_TODAY = 12;
const MAX_DESTACADOS_WEEK = 15;
/** Estrenos editoriales visibles en Destacados tras la fecha de estreno. */
const CURATED_MOVIE_GRACE_DAYS = 21;

/** Cuántas tarjetas se ven antes de mostrar flechas de navegación. */
export const DESTACADOS_VISIBLE_SLOTS = 3;

/** Cuántas tarjetas avanza cada clic en las flechas. */
export const DESTACADOS_SCROLL_STEP = 3;

export type DestacadosScope = "today" | "week";

export type PickCuratedDestacadosOptions = {
  todayKey?: string;
  scope?: DestacadosScope;
  windowDays?: number;
  /** Evita duplicar en la fila de semana lo ya mostrado hoy. */
  excludeIds?: Set<number>;
};

export { isChampionsFinal, isDestacadoFinal, isDestacadoPremiere } from "./event-card-stamp";

function matchesRule(event: EventRow, rule: DestacadoRule): boolean {
  if (rule.externalId) {
    const id = event.external_id ?? "";
    const externalMatch =
      typeof rule.externalId === "string"
        ? id === rule.externalId
        : rule.externalId.test(id);
    if (externalMatch) return true;
  }

  if (rule.titleMatch) {
    const title = event.title ?? "";
    if (rule.titleMatch.test(title)) return true;
  }

  if (rule.externalId || rule.titleMatch) return false;

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

/** Orden cronológico: izquierda = menos tiempo restante, derecha = más. */
export function sortDestacadosBySoonest(a: EventRow, b: EventRow): number {
  const dateCmp = (a.date ?? "").localeCompare(b.date ?? "");
  if (dateCmp !== 0) return dateCmp;
  return (a.time ?? "").localeCompare(b.time ?? "");
}

function sortTodayItems(a: EventRow, b: EventRow): number {
  return (
    eventPriority(b) - eventPriority(a) ||
    sortDestacadosBySoonest(a, b)
  );
}

function weekPoolFor(
  events: EventRow[],
  todayKey: string,
  windowDays: number,
  excludeIds: Set<number>
): EventRow[] {
  const weekEnd = addDaysToDateKey(todayKey, windowDays - 1);
  const curatedGraceStart = addDaysToDateKey(
    todayKey,
    -CURATED_MOVIE_GRACE_DAYS
  );

  return events.filter((event) => {
    if (!event.date || excludeIds.has(event.id)) return false;

    if (event.date >= todayKey && event.date <= weekEnd) return true;

    if (isCuratedMovieEvent(event)) {
      const curated = curatedMovieByExternalId(event.external_id);
      const releaseDate = curated?.releaseDate ?? event.date;
      return releaseDate >= curatedGraceStart && releaseDate <= weekEnd;
    }

    return false;
  });
}

function findEditorialMatch(
  events: EventRow[],
  rule: DestacadoRule,
  excludeIds: Set<number>
): EventRow | undefined {
  return events.find(
    (event) => !excludeIds.has(event.id) && matchesRule(event, rule)
  );
}

/** Qué veo hoy: TV, reality y relleno del día. */
export function pickTodayDestacados(
  events: EventRow[],
  options: PickCuratedDestacadosOptions = {}
): EventRow[] {
  const today = options.todayKey ?? toMadridDateKey(new Date());
  const windowDays = options.windowDays ?? 7;
  const week = new Set(getMadridWeekDates(windowDays));
  const todayPool = events.filter(
    (e) => e.date === today && e.date && week.has(e.date)
  );

  const items: EventRow[] = [];
  const seen = new Set<number>();

  const add = (event: EventRow) => {
    if (seen.has(event.id)) return;
    seen.add(event.id);
    items.push(event);
  };

  for (const event of todayPool) {
    if (matchesFlagshipTv(event)) add(event);
  }

  for (const event of todayPool) {
    if (seen.has(event.id)) continue;
    if (isSpanishTvFlagship(event)) add(event);
  }

  for (const event of todayPool) {
    if (seen.has(event.id)) continue;
    if (isSeasonPremiereEvent(event)) add(event);
  }

  if (items.length < MIN_DESTACADOS_TODAY) {
    const candidates = todayPool
      .filter((event) => !seen.has(event.id))
      .sort(sortTodayItems);

    for (const event of candidates) {
      if (items.length >= MAX_DESTACADOS_TODAY) break;
      add(event);
    }
  }

  return items.sort(sortDestacadosBySoonest).slice(0, MAX_DESTACADOS_TODAY);
}

/** Esta semana: Champions, estrenos, series seguidas y reglas editoriales. */
export function pickWeekDestacados(
  events: EventRow[],
  options: PickCuratedDestacadosOptions = {}
): EventRow[] {
  const excludeIds = options.excludeIds ?? new Set<number>();
  const todayKey = options.todayKey ?? toMadridDateKey(new Date());
  const windowDays = options.windowDays ?? 7;
  const pool = weekPoolFor(events, todayKey, windowDays, excludeIds);

  const items: EventRow[] = [];
  const seen = new Set<number>();

  const add = (event: EventRow) => {
    if (seen.has(event.id) || excludeIds.has(event.id)) return;
    seen.add(event.id);
    items.push(event);
  };

  for (const rule of DESTACADOS_RULES) {
    const match =
      findEditorialMatch(pool, rule, excludeIds) ??
      findEditorialMatch(events, rule, excludeIds);
    if (match) add(match);
  }

  for (const event of pool) {
    if (isDestacadoFinal(event)) add(event);
  }

  for (const event of pool) {
    if (isDestacadoPremiere(event)) add(event);
  }

  for (const event of pool) {
    if (matchesFollowedSeries(event)) add(event);
  }

  return items.sort(sortDestacadosBySoonest).slice(0, MAX_DESTACADOS_WEEK);
}

/** @deprecated Usar pickTodayDestacados + pickWeekDestacados */
export function pickCuratedDestacados(
  events: EventRow[],
  options: PickCuratedDestacadosOptions = {}
): EventRow[] {
  const today = pickTodayDestacados(events, options);
  const excludeIds = new Set(today.map((e) => e.id));
  const week = pickWeekDestacados(events, { ...options, excludeIds });
  return [...today, ...week];
}

export { isSeasonPremiereEvent };
