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
  statusMessage?: string;
};

function parseTmdbIdsFromExternalId(externalId?: string | null): JustWatchMediaRef | null {
  const movie = externalId?.match(/^tmdb_movie_(\d+)$/);
  if (movie) {
    return { objectType: "movie", tmdbId: parseInt(movie[1], 10) };
  }

  const showDetailed = externalId?.match(
    /^tmdb_tv(?:_reality)?_(\d+)_(\d{4}-\d{2}-\d{2})_s(\d+)e(\d+)$/
  );
  if (showDetailed) {
    return {
      objectType: "show",
      tmdbId: parseInt(showDetailed[1], 10),
      season: parseInt(showDetailed[3], 10),
      episode: parseInt(showDetailed[4], 10),
    };
  }

  const showBare = externalId?.match(/^tmdb_tv(?:_reality)?_(\d+)_/);
  if (showBare) {
    return { objectType: "show", tmdbId: parseInt(showBare[1], 10) };
  }

  return null;
}

export function parseJustWatchMediaRef(
  sport?: string | null,
  externalId?: string | null
): JustWatchMediaRef | null {
  if (!externalId) return null;
  if (sport !== "cine" && sport !== "series" && sport !== "tv") return null;
  return parseTmdbIdsFromExternalId(externalId);
}

export function justWatchTitleUrl(fullPath?: string | null): string | null {
  const path = fullPath?.trim();
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${JUSTWATCH_SITE}${path.startsWith("/") ? path : `/${path}`}`;
}
