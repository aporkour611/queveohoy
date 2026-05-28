import type { EventRow } from "../components/types";

/** TMDB genre id: Animation */
const TMDB_ANIMATION_GENRE_ID = 16;

const ANIME_TITLE_PATTERNS = [
  /^re:\s*zero/i,
  /\bre-?zero\b/i,
  /^attack on titan/i,
  /^demon slayer/i,
  /^one piece\b/i,
  /^my hero academia/i,
  /^jujutsu kaisen/i,
  /^spy x family/i,
  /^chainsaw man/i,
  /^frieren/i,
];

type TmdbAnimeHints = {
  genres?: Array<{ id?: number }>;
  origin_country?: string[];
};

export function isAnimeSeriesTitle(title: string): boolean {
  const base = title.split(" — ")[0]?.trim() ?? title.trim();
  if (!base) return false;
  return ANIME_TITLE_PATTERNS.some((pattern) => pattern.test(base));
}

export function isTmdbAnimeSeries(
  detail: TmdbAnimeHints,
  title?: string
): boolean {
  if (title && isAnimeSeriesTitle(title)) return true;

  const genres = detail.genres ?? [];
  const hasAnimation = genres.some(
    (genre) => genre.id === TMDB_ANIMATION_GENRE_ID
  );
  if (!hasAnimation) return false;

  return (detail.origin_country ?? []).includes("JP");
}

export function resolveFeedSport(event: EventRow): string {
  if (event.sport === "series" && isAnimeSeriesEvent(event)) return "anime";
  return event.sport ?? "otros";
}

export function isAnimeSeriesEvent(event: EventRow): boolean {
  if (event.sport === "anime") return true;
  if (event.sport !== "series") return false;
  return isAnimeSeriesTitle(event.title ?? "");
}
