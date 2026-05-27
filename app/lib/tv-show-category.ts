import type { EventRow } from "../components/types";
import { matchesSpanishTvFlagship } from "./spanish-tv-curated";

export type TvShowCategory = "reality" | "concurso" | "evento";

export const TV_SPORT_FILTER_IDS = ["tv-reality", "tv-concurso"] as const;

const CONCURSO_PATTERNS = [
  /concurso/i,
  /eurovisi[oó]n|eurovision song contest/i,
  /operaci[oó]n triunfo|\bOT\b/i,
  /master\s*chef/i,
  /mask singer|the masked singer/i,
];

const REALITY_PATTERNS = [
  /reality/i,
  /gran hermano/i,
  /supervivientes|survivor/i,
  /isla de las tentaciones|temptation island/i,
];

export function getTvShowCategory(event: EventRow): TvShowCategory | null {
  if (event.sport !== "tv") return null;

  const curated = matchesSpanishTvFlagship(event);
  if (curated?.category) return curated.category;

  const blob = `${event.competition ?? ""} ${event.title ?? ""}`;
  if (CONCURSO_PATTERNS.some((pattern) => pattern.test(blob))) return "concurso";
  if (REALITY_PATTERNS.some((pattern) => pattern.test(blob))) return "reality";

  return "reality";
}

export function tvCategoryLabel(category: TvShowCategory): string {
  if (category === "concurso") return "Concurso";
  if (category === "evento") return "Evento";
  return "Reality";
}

export function eventMatchesSportFilter(
  event: EventRow,
  filterId: string
): boolean {
  const sport = event.sport ?? "";
  if (filterId === sport) return true;
  if (filterId === "tv" && sport === "tv") return true;
  if (sport !== "tv") return false;

  const category = getTvShowCategory(event);
  if (filterId === "tv-reality") return category === "reality";
  if (filterId === "tv-concurso") return category === "concurso";
  return false;
}

export function eventMatchesSportFilters(
  event: EventRow,
  filters: Iterable<string>
): boolean {
  for (const filterId of filters) {
    if (eventMatchesSportFilter(event, filterId)) return true;
  }
  return false;
}
