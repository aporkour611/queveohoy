import { parseTmdbEpisodeMeta } from "./tmdb";

export const JUSTWATCH_SITE = "https://www.justwatch.com";

export type JustWatchMediaRef = {
  objectType: "movie" | "show";
  tmdbId: number;
  season?: number;
  episode?: number;
};

export type JustWatchOfferView = {
  providerName: string;
  providerIcon?: string;
  monetizationLabel: string;
  priceLabel?: string;
  url: string;
};

export type JustWatchAvailability = {
  title?: string;
  titleUrl: string;
  offers: JustWatchOfferView[];
};

export function parseJustWatchMediaRef(
  sport?: string | null,
  externalId?: string | null
): JustWatchMediaRef | null {
  if (sport === "cine") {
    const match = externalId?.match(/^tmdb_movie_(\d+)$/);
    if (!match) return null;
    return { objectType: "movie", tmdbId: parseInt(match[1], 10) };
  }

  if (sport === "series") {
    const match = externalId?.match(/^tmdb_tv_(\d+)_/);
    if (!match) return null;
    const episodeMeta = parseTmdbEpisodeMeta(externalId);
    return {
      objectType: "show",
      tmdbId: parseInt(match[1], 10),
      season: episodeMeta?.season,
      episode: episodeMeta?.episode,
    };
  }

  return null;
}

export function justWatchTitleUrl(fullPath?: string | null): string | null {
  const path = fullPath?.trim();
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${JUSTWATCH_SITE}${path.startsWith("/") ? path : `/${path}`}`;
}
