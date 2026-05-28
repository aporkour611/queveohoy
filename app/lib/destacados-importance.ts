import type { EventRow } from "../components/types";
import { isDestacadoFinal } from "./event-card-stamp";
import { eventPriority } from "./featured";
import { isCuratedSeriesEvent } from "./curated-series-events";
import { isCuratedMovieEvent } from "./movies-curated";
import { isRolandGarrosWeekDestacado } from "./roland-garros";
import { getTvShowCategory } from "./tv-show-category";

/** Orden editorial de categorías en destacados (1 ficha por categoría). */
export const DESTACADO_IMPORTANCE_TIERS = [
  "cine",
  "champions",
  "ufc",
  "roland-garros",
  "reality",
  "directos",
  "finales",
  "series",
  "anime",
  "rest",
] as const;

export type DestacadoImportanceTier = (typeof DESTACADO_IMPORTANCE_TIERS)[number];

const FINALES_SPORT_IDS = new Set([
  "csgo",
  "valorant",
  "lol",
  "ciclismo",
  "basket",
  "formula1",
  "motos",
]);

const FOLLOWED_SERIES_PATTERNS = [/^FROM\b/i, /^Euphoria\b/i];

/** Partidos de Champions en eliminatorias/final (no jornadas de fase de grupos). */
export function isChampionsWeekDestacado(event: EventRow): boolean {
  if (event.sport !== "futbol") return false;
  const comp = event.competition ?? "";
  const blob = `${comp} ${event.title ?? ""} ${event.home_team ?? ""} ${event.away_team ?? ""}`;
  if (!/champions/i.test(blob)) return false;
  if (/jornada\s*\d|matchday\s*\d|fase de grupos|group stage/i.test(blob)) {
    return false;
  }
  return true;
}

function isCineDestacado(event: EventRow): boolean {
  if (isCuratedMovieEvent(event)) return true;
  return event.sport === "cine";
}

function isSeriesDestacado(event: EventRow): boolean {
  if (event.sport === "series") return true;
  if (isCuratedSeriesEvent(event)) return true;
  const title = event.title ?? "";
  return FOLLOWED_SERIES_PATTERNS.some((pattern) => pattern.test(title));
}

function isMotorEsportsFinal(event: EventRow): boolean {
  if (!isDestacadoFinal(event)) return false;
  return FINALES_SPORT_IDS.has(event.sport ?? "");
}

export function getDestacadoImportanceTier(
  event: EventRow
): DestacadoImportanceTier {
  if (isCineDestacado(event)) return "cine";
  if (isChampionsWeekDestacado(event)) return "champions";
  if (event.sport === "ufc") return "ufc";
  if (isRolandGarrosWeekDestacado(event)) return "roland-garros";

  if (event.sport === "tv") {
    const category = getTvShowCategory(event);
    if (category === "reality") return "reality";
    if (category === "directo") return "directos";
  }

  if (isMotorEsportsFinal(event)) return "finales";
  if (isSeriesDestacado(event)) return "series";
  if (event.sport === "anime") return "anime";
  return "rest";
}

export function tierRank(tier: DestacadoImportanceTier): number {
  return DESTACADO_IMPORTANCE_TIERS.indexOf(tier);
}

/** Comparación dentro de la misma categoría: más relevante y más próximo primero. */
export function compareDestacadosWithinTier(a: EventRow, b: EventRow): number {
  const prio = eventPriority(b) - eventPriority(a);
  if (prio !== 0) return prio;

  const dateCmp = (a.date ?? "").localeCompare(b.date ?? "");
  if (dateCmp !== 0) return dateCmp;

  const timeCmp = (a.time ?? "").localeCompare(b.time ?? "");
  if (timeCmp !== 0) return timeCmp;

  return (a.title ?? "").localeCompare(b.title ?? "", "es");
}

export function sortDestacadosByImportance(a: EventRow, b: EventRow): number {
  const tierCmp =
    tierRank(getDestacadoImportanceTier(a)) -
    tierRank(getDestacadoImportanceTier(b));
  if (tierCmp !== 0) return tierCmp;
  return compareDestacadosWithinTier(a, b);
}

/** Una sola ficha por categoría, ordenadas por importancia editorial. */
export function pickOneDestacadoPerTier(events: EventRow[]): EventRow[] {
  const best = new Map<DestacadoImportanceTier, EventRow>();

  for (const event of events) {
    const tier = getDestacadoImportanceTier(event);
    const current = best.get(tier);
    if (!current || compareDestacadosWithinTier(current, event) > 0) {
      best.set(tier, event);
    }
  }

  return DESTACADO_IMPORTANCE_TIERS.filter((tier) => best.has(tier)).map(
    (tier) => best.get(tier)!
  );
}
