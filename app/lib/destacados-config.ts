import type { EventRow } from "../components/types";
import { addDaysToDateKey, toMadridDateKey } from "./madrid-time";
import {
  curatedMovieByExternalId,
  isCuratedMovieEvent,
} from "./movies-curated";
import { mergeCuratedMovieEvents } from "./curated-movie-events";
import {
  isCuratedSeriesEvent,
  mergeCuratedSeriesEvents,
} from "./curated-series-events";
import {
  isRecurringFlagshipSpanishTvEvent,
  mergeCuratedSpanishTvEvents,
} from "./curated-tv-events";
import { isSpanishTvDestacadosEligible } from "./spanish-tv-curated";
import { isTvFictionSeriesEvent } from "./tv-show-category";
import { isSeasonPremiereEvent } from "./tmdb";
import { mergeUfcWeekEvents } from "./curated-ufc-events";
import { pickOneDestacadoPerTier } from "./destacados-importance";

export {
  DESTACADO_IMPORTANCE_TIERS,
  compareDestacadosWithinTier,
  getDestacadoImportanceTier,
  pickOneDestacadoPerTier,
  sortDestacadosByImportance,
  tierRank,
  type DestacadoImportanceTier,
} from "./destacados-importance";
export { isChampionsWeekDestacado } from "./destacados-importance";
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
    id: "el-drama",
    externalId: "tmdb_movie_1325734",
    titleMatch: /^(the\s+)?drama\b|^el\s+drama\b/i,
  },
  {
    id: "topuria-gaethje",
    titleMatch: /topuria/i,
    teams: { a: /topuria|ilia/i, b: /gaethje|justin/i },
  },
  {
    id: "psg-arsenal",
    teamIds: ["524", "57"],
  },
];

/** Cada nuevo episodio de estas series va a Destacados (siempre visibles, como Euphoria). */
export { FOLLOWED_SERIES_PATTERNS as DESTACADOS_SERIES_PATTERNS } from "./destacados-importance";

const MAX_DESTACADOS_TODAY = 10;
const MAX_DESTACADOS_WEEK = 10;

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

function mergeDestacadosEvents(
  events: EventRow[],
  todayKey: string,
  windowDays: number
): EventRow[] {
  return mergeUfcWeekEvents(
    mergeCuratedSpanishTvEvents(
      mergeCuratedSeriesEvents(
        mergeCuratedMovieEvents(events, todayKey),
        todayKey,
        windowDays
      ),
      todayKey,
      windowDays
    ),
    todayKey
  );
}

/** Destacados: TV de máxima audiencia; el filtro TV del calendario muestra todo el catálogo. */
function filterSpanishTvForDestacados(events: EventRow[]): EventRow[] {
  return events.filter(
    (event) =>
      event.sport !== "tv" ||
      isTvFictionSeriesEvent(event) ||
      isSpanishTvDestacadosEligible(event)
  );
}

export { isChampionsFinal, isDestacadoFinal, isDestacadoPremiere } from "./event-card-stamp";
export {
  isRolandGarrosEvent,
  isRolandGarrosKnockout,
  isRolandGarrosWeekDestacado,
} from "./roland-garros";

/** Orden cronológico: izquierda = antes en el tiempo (fecha, hora, título). */
export function sortDestacadosBySoonest(a: EventRow, b: EventRow): number {
  const dateCmp = (a.date ?? "").localeCompare(b.date ?? "");
  if (dateCmp !== 0) return dateCmp;
  const timeCmp = (a.time ?? "").localeCompare(b.time ?? "");
  if (timeCmp !== 0) return timeCmp;
  return (a.title ?? "").localeCompare(b.title ?? "", "es");
}

function isPinnedWeekDestacado(event: EventRow): boolean {
  return (
    isCuratedMovieEvent(event) ||
    isCuratedSeriesEvent(event) ||
    isRecurringFlagshipSpanishTvEvent(event)
  );
}

function curatedMovieReleaseInWeek(
  event: EventRow,
  todayKey: string,
  weekEnd: string
): boolean {
  if (!isCuratedMovieEvent(event)) return false;
  const curated = curatedMovieByExternalId(event.external_id);
  const releaseDate = curated?.releaseDate ?? event.date ?? "";
  return releaseDate >= todayKey && releaseDate <= weekEnd;
}

function weekPoolFor(
  events: EventRow[],
  todayKey: string,
  windowDays: number,
  excludeIds: Set<number>
): EventRow[] {
  const weekEnd = addDaysToDateKey(todayKey, windowDays - 1);

  return events.filter((event) => {
    if (!event.date) return false;
    if (excludeIds.has(event.id) && !isPinnedWeekDestacado(event)) return false;

    if (event.date >= todayKey && event.date <= weekEnd) return true;

    return curatedMovieReleaseInWeek(event, todayKey, weekEnd);
  });
}

/** Qué veo hoy: una ficha por categoría, ordenadas por importancia editorial. */
export function pickTodayDestacados(
  events: EventRow[],
  options: PickCuratedDestacadosOptions = {}
): EventRow[] {
  const today = options.todayKey ?? toMadridDateKey(new Date());
  const windowDays = options.windowDays ?? 7;
  const mergedEvents = mergeDestacadosEvents(events, today, windowDays);
  const week = new Set(
    Array.from({ length: windowDays }, (_, i) => addDaysToDateKey(today, i))
  );
  const todayPool = filterSpanishTvForDestacados(
    mergedEvents.filter(
      (event) => event.date === today && event.date && week.has(event.date)
    )
  );

  return pickOneDestacadoPerTier(todayPool).slice(0, MAX_DESTACADOS_TODAY);
}

/** Esta semana: una ficha por categoría, orden cronológico (fecha y hora). */
export function pickWeekDestacados(
  events: EventRow[],
  options: PickCuratedDestacadosOptions = {}
): EventRow[] {
  const excludeIds = options.excludeIds ?? new Set<number>();
  const todayKey = options.todayKey ?? toMadridDateKey(new Date());
  const windowDays = options.windowDays ?? 7;
  const mergedEvents = mergeDestacadosEvents(events, todayKey, windowDays);
  const pool = filterSpanishTvForDestacados(
    weekPoolFor(mergedEvents, todayKey, windowDays, excludeIds)
  );

  return pickOneDestacadoPerTier(pool)
    .sort(sortDestacadosBySoonest)
    .slice(0, MAX_DESTACADOS_WEEK);
}

export { isSeasonPremiereEvent };
