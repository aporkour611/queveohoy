import { addDaysToDateKey } from "./madrid-time";
import { isoWeekdayFromDateKey } from "./curated-tv-events";
import {
  CURATED_SERIES_EPISODES,
  type CuratedSeriesEpisode,
} from "./series-curated";
import type { SpanishTvShow } from "./spanish-tv-curated";

/** Plataformas de streaming reconocidas en España (TMDB watch/providers ES). */
export type SpainStreamingBrand =
  | "hbo_max"
  | "netflix"
  | "disney"
  | "prime"
  | "apple"
  | "paramount"
  | "sky"
  | "movistar"
  | "filmin"
  | "spanish_linear"
  | "unknown";

export type SpainEpisodeScheduleInput = {
  tmdbShowId: number;
  /** air_date cruda de TMDB (suele ser calendario US). */
  tmdbAirDate: string;
  season: number;
  episode: number;
  originCountries?: string[];
  networkNames?: string[];
  providerNames?: string[];
  spanishTvCurated?: SpanishTvShow;
};

export type SpainEpisodeSchedule = {
  date: string;
  time: string;
  platform: string;
  /** Cómo se resolvió la fecha/hora. */
  source:
    | "curated_series"
    | "spanish_origin"
    | "spanish_tv_curated"
    | "hbo_max_rule"
    | "global_drop_rule"
    | "prime_midnight_rule"
    | "tmdb_raw";
};

const DEFAULT_LINEAR_TIME = "22:00";
const HBO_MAX_SPAIN_TIME = "03:00";
const GLOBAL_DROP_TIME = "09:00";
const PRIME_DROP_TIME = "00:00";

const SPANISH_ORIGIN = new Set(["ES", "SP"]);

function normalizeProviderName(raw: string): string {
  return raw.trim().toLowerCase();
}

/** Infiere la plataforma en España a partir de TMDB watch/providers o networks. */
export function inferSpainStreamingBrand(input: {
  providerNames?: string[];
  networkNames?: string[];
  originCountries?: string[];
}): SpainStreamingBrand {
  const blob = [...(input.providerNames ?? []), ...(input.networkNames ?? [])]
    .map(normalizeProviderName)
    .join(" ");

  if (!blob.trim()) {
    if (input.originCountries?.some((c) => SPANISH_ORIGIN.has(c.toUpperCase()))) {
      return "spanish_linear";
    }
    return "unknown";
  }

  if (/hbo max|\bmax\b|hbo\b/.test(blob) && !/cinemax/.test(blob)) return "hbo_max";
  if (/netflix/.test(blob)) return "netflix";
  if (/disney/.test(blob)) return "disney";
  if (/prime|amazon/.test(blob)) return "prime";
  if (/apple/.test(blob)) return "apple";
  if (/paramount/.test(blob)) return "paramount";
  if (/sky showtime|\bsky\b/.test(blob)) return "sky";
  if (/movistar|m\+/.test(blob)) return "movistar";
  if (/filmin/.test(blob)) return "filmin";
  if (/rtve|telecinco|antena|atresmedia|la 1|la 2|cuatro/.test(blob)) {
    return "spanish_linear";
  }

  if (input.originCountries?.some((c) => SPANISH_ORIGIN.has(c.toUpperCase()))) {
    return "spanish_linear";
  }

  return "unknown";
}

export function spainPlatformLabel(brand: SpainStreamingBrand): string {
  switch (brand) {
    case "hbo_max":
      return "HBO Max";
    case "netflix":
      return "Netflix";
    case "disney":
      return "Disney+";
    case "prime":
      return "Prime Video";
    case "apple":
      return "Apple TV+";
    case "paramount":
      return "Paramount+";
    case "sky":
      return "Sky Showtime";
    case "movistar":
      return "Movistar+";
    case "filmin":
      return "Filmin";
    case "spanish_linear":
      return "TV y streaming";
    default:
      return "TV y streaming";
  }
}

function findCuratedSeriesOverride(
  tmdbShowId: number,
  season: number,
  episode: number
): CuratedSeriesEpisode | undefined {
  return CURATED_SERIES_EPISODES.find(
    (item) =>
      item.tmdbId === tmdbShowId &&
      item.season === season &&
      item.episode === episode
  );
}

function isSpanishOrigin(originCountries?: string[]): boolean {
  return originCountries?.some((c) => SPANISH_ORIGIN.has(c.toUpperCase())) ?? false;
}

/**
 * Convierte air_date TMDB (US) a fecha/hora visibles en península y Baleares.
 * Prioridad: curado editorial → TV España → origen ES → reglas por plataforma.
 */
export function resolveSpainEpisodeSchedule(
  input: SpainEpisodeScheduleInput
): SpainEpisodeSchedule {
  const curated = findCuratedSeriesOverride(
    input.tmdbShowId,
    input.season,
    input.episode
  );
  if (curated) {
    return {
      date: curated.airDate,
      time: curated.airTime ?? HBO_MAX_SPAIN_TIME,
      platform: curated.platform,
      source: "curated_series",
    };
  }

  if (input.spanishTvCurated) {
    return {
      date: input.tmdbAirDate,
      time:
        input.spanishTvCurated.airTime ??
        DEFAULT_LINEAR_TIME,
      platform: input.spanishTvCurated.platform,
      source: "spanish_tv_curated",
    };
  }

  if (isSpanishOrigin(input.originCountries)) {
    return {
      date: input.tmdbAirDate,
      time: DEFAULT_LINEAR_TIME,
      platform: "TV y streaming",
      source: "spanish_origin",
    };
  }

  const brand = inferSpainStreamingBrand(input);
  const platform = spainPlatformLabel(brand);

  if (brand === "hbo_max") {
    const weekday = isoWeekdayFromDateKey(input.tmdbAirDate);
    if (weekday === 7) {
      return {
        date: addDaysToDateKey(input.tmdbAirDate, 1),
        time: HBO_MAX_SPAIN_TIME,
        platform,
        source: "hbo_max_rule",
      };
    }
    return {
      date: input.tmdbAirDate,
      time: HBO_MAX_SPAIN_TIME,
      platform,
      source: "hbo_max_rule",
    };
  }

  if (
    brand === "netflix" ||
    brand === "disney" ||
    brand === "apple" ||
    brand === "paramount" ||
    brand === "sky"
  ) {
    return {
      date: input.tmdbAirDate,
      time: GLOBAL_DROP_TIME,
      platform,
      source: "global_drop_rule",
    };
  }

  if (brand === "prime") {
    return {
      date: input.tmdbAirDate,
      time: PRIME_DROP_TIME,
      platform,
      source: "prime_midnight_rule",
    };
  }

  return {
    date: input.tmdbAirDate,
    time: DEFAULT_LINEAR_TIME,
    platform,
    source: "tmdb_raw",
  };
}

type TmdbWatchProvidersResponse = {
  results?: Record<
    string,
    {
      flatrate?: Array<{ provider_name?: string }>;
      buy?: Array<{ provider_name?: string }>;
      rent?: Array<{ provider_name?: string }>;
    }
  >;
};

type TmdbMovieReleaseDatesResponse = {
  results?: Array<{
    iso_3166_1?: string;
    release_dates?: Array<{
      type?: number;
      release_date?: string;
    }>;
  }>;
};

/** Extrae nombres de proveedores flatrate en España desde la respuesta TMDB. */
export function extractSpainProviderNames(
  payload: TmdbWatchProvidersResponse | null | undefined
): string[] {
  const es = payload?.results?.ES;
  if (!es) return [];

  const names = new Set<string>();
  for (const bucket of [es.flatrate, es.buy, es.rent]) {
    for (const item of bucket ?? []) {
      const name = item.provider_name?.trim();
      if (name) names.add(name);
    }
  }
  return [...names];
}

/** Fecha de estreno en cines españoles (type 3 = theatrical). */
export function extractSpainTheatricalReleaseDate(
  payload: TmdbMovieReleaseDatesResponse | null | undefined
): string | null {
  const es = payload?.results?.find((row) => row.iso_3166_1 === "ES");
  if (!es?.release_dates?.length) return null;

  const theatrical = es.release_dates
    .filter((row) => row.type === 3 && row.release_date)
    .map((row) => row.release_date!.slice(0, 10))
    .sort();

  return theatrical[0] ?? null;
}
