import type { EventRow } from "../components/types";
import { resolveFeedSport } from "./anime-classify";
import { matchesSpanishTvFlagship } from "./spanish-tv-curated";

export type TvShowCategory = "reality" | "concurso" | "directo";

export const TV_SPORT_FILTER_IDS = [
  "tv-reality",
  "tv-concurso",
  "tv-directo",
];

const CONCURSO_PATTERNS = [
  /concurso/i,
  /eurovisi[oó]n|eurovision song contest/i,
  /operaci[oó]n triunfo/i,
  /master\s*chef/i,
  /mask singer|the masked singer/i,
  /pasapalabra/i,
  /tu cara me suena/i,
  /la ruleta de la suerte/i,
];

const REALITY_PATTERNS = [
  /reality/i,
  /gran hermano/i,
  /supervivientes|survivor/i,
  /isla de las tentaciones|temptation island/i,
];

const DIRECTO_PATTERNS = [
  /directo/i,
  /talk show/i,
  /\bevento\b/i,
  /velada del a[nñ]o|la velada\b/i,
  /el hormiguero|hormiguero 3\.0/i,
  /la revuelta/i,
  /late xou/i,
  /twitch/i,
  /kick\b/i,
  /youtube live/i,
  /streaming en directo/i,
];

const FICCION_PATTERNS = [/ficci[oó]n/i, /sue[nñ]os de libertad/i, /la promesa/i];

function isDirectoPlatform(platform?: string | null): boolean {
  return /twitch|kick|youtube/i.test(platform ?? "");
}

/** Telenovelas / ficción diaria en TV lineal → bloque Series, no Reality. */
export function isTvFictionSeriesEvent(event: EventRow): boolean {
  if (event.sport !== "tv") return false;

  const curated = matchesSpanishTvFlagship(event);
  if (curated?.category === "ficcion") return true;

  const blob = `${event.competition ?? ""} ${event.title ?? ""}`;
  return FICCION_PATTERNS.some((pattern) => pattern.test(blob));
}

export function getTvShowCategory(event: EventRow): TvShowCategory | null {
  if (event.sport !== "tv") return null;
  if (isTvFictionSeriesEvent(event)) return null;

  const curated = matchesSpanishTvFlagship(event);
  if (curated?.category && curated.category !== "ficcion") {
    return curated.category;
  }

  const blob = `${event.competition ?? ""} ${event.title ?? ""} ${event.platform ?? ""}`;
  if (
    isDirectoPlatform(event.platform) ||
    DIRECTO_PATTERNS.some((pattern) => pattern.test(blob))
  ) {
    return "directo";
  }
  if (CONCURSO_PATTERNS.some((pattern) => pattern.test(blob))) return "concurso";
  if (REALITY_PATTERNS.some((pattern) => pattern.test(blob))) return "reality";

  return null;
}

export function tvCategoryLabel(category: TvShowCategory): string {
  if (category === "concurso") return "Concurso";
  if (category === "directo") return "TV";
  return "Reality";
}

export function eventMatchesSportFilter(
  event: EventRow,
  filterId: string
): boolean {
  const sport = resolveFeedSport(event);
  if (filterId === sport) return true;
  if (filterId === "series" && isTvFictionSeriesEvent(event)) return true;
  if (filterId === "tv" && sport === "tv") return true;
  if (sport !== "tv") return false;
  if (isTvFictionSeriesEvent(event)) return false;

  const category = getTvShowCategory(event);
  if (filterId === "tv-reality") return category === "reality";
  if (filterId === "tv-concurso") return category === "concurso";
  if (filterId === "tv-directo") return category === "directo";
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
