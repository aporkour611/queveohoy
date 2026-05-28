import { addDaysToDateKey, getMadridWeekDates, toMadridDateKey } from "./madrid-time";
import { CURATED_MOVIES } from "./movies-curated";
import { STREAMING_PRIORITY_TMDB_IDS } from "./streaming-curated";
import { formatSeriesEpisodeTitle } from "./series-display";
import {
  extractSpainProviderNames,
  extractSpainTheatricalReleaseDate,
  resolveSpainEpisodeSchedule,
} from "./spain-air-schedule";
import { isExcludedUsTvTitle } from "./spain-latam-media";
import {
  encodeTmdbSource,
  parseTmdbBuzzScore,
} from "./tmdb-client";

export {
  isSeasonPremiereEvent,
  parseTmdbBuzzScore,
  parseTmdbEpisodeMeta,
  parseTmdbPoster,
  encodeTmdbSource,
} from "./tmdb-client";

const TMDB_BASE = "https://api.themoviedb.org/3";

/** Máximo importado por semana (solo lo más popular) */
export const TMDB_MAX_MOVIES_WEEK = 4;
export const TMDB_MAX_SERIES_WEEK = 4;

/** Al filtrar cine/series en la UI: tope por día */
export const TMDB_MAX_MEDIA_PER_DAY = 2;

const MIN_MOVIE_VOTES = 80;
const MIN_TV_VOTES = 150;
const MIN_VOTE_AVERAGE = 6.8;
const MIN_BUZZ_SCORE = 120;

export type TmdbCronEvent = {
  external_id: string;
  title: string;
  date: string;
  time?: string;
  sport: "cine" | "series";
  category: "cine";
  competition: string;
  platform: string;
  source: string;
};

type TmdbItem = {
  id: number;
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  release_date?: string;
  poster_path?: string | null;
  popularity?: number;
  vote_count?: number;
  vote_average?: number;
};

type TmdbWatchProviders = {
  results?: Record<
    string,
    {
      flatrate?: Array<{ provider_name?: string }>;
      buy?: Array<{ provider_name?: string }>;
      rent?: Array<{ provider_name?: string }>;
    }
  >;
};

type TmdbMovieReleaseDates = {
  results?: Array<{
    iso_3166_1?: string;
    release_dates?: Array<{
      type?: number;
      release_date?: string;
    }>;
  }>;
};

type TmdbShowDetail = {
  id: number;
  name?: string;
  poster_path?: string | null;
  vote_count?: number;
  vote_average?: number;
  popularity?: number;
  origin_country?: string[];
  networks?: { name?: string }[];
  next_episode_to_air?: {
    air_date?: string;
    episode_number?: number;
    season_number?: number;
    name?: string;
  } | null;
};

type ScoredEvent = {
  event: TmdbCronEvent;
  score: number;
};

export function getTmdbApiKey(): string | undefined {
  return process.env.TMDB_API_KEY?.trim();
}

/** Puntuación tipo audiencia/búsquedas: trending + votos + nota TMDB */
export function tmdbBuzzScore(item: {
  popularity?: number;
  vote_count?: number;
  vote_average?: number;
  trendingRank?: number;
}): number {
  const votes = item.vote_count ?? 0;
  const avg = item.vote_average ?? 0;
  const pop = item.popularity ?? 0;

  if (votes <= 0 || avg <= 0) return 0;

  let score =
    pop * 2.5 +
    Math.log10(votes + 1) * 35 +
    avg * 12;

  if (item.trendingRank !== undefined) {
    score += Math.max(0, 120 - item.trendingRank * 6);
  }

  return Math.round(score);
}

export function seriesCompetitionLabel(
  season: number,
  episode: number,
  trendingRank: number | undefined
): string {
  if (episode === 1 && season >= 2) {
    return `Estreno · Temporada ${season}`;
  }
  if (episode === 1 && season === 1) {
    return "Estreno · Temporada 1";
  }
  if (trendingRank !== undefined && trendingRank <= 4) {
    return "Serie top · Nuevo episodio";
  }
  return "Nuevo episodio";
}

/** Series que el cron siempre vigila (episodios en Destacados) */
export const EDITORIAL_TV_TMDB_IDS = STREAMING_PRIORITY_TMDB_IDS;

async function tmdbGet<T>(
  path: string,
  params: Record<string, string> = {}
): Promise<T | null> {
  const apiKey = getTmdbApiKey();
  if (!apiKey) return null;

  const qs = new URLSearchParams({
    api_key: apiKey,
    language: "es-ES",
    ...params,
  });

  const res = await fetch(`${TMDB_BASE}${path}?${qs}`, {
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    console.error(`TMDB ${path}: HTTP ${res.status}`);
    return null;
  }

  return res.json() as Promise<T>;
}

function defaultPlatformForMovie(): string {
  return "Cines";
}

async function fetchSpainMovieReleaseDate(movieId: number): Promise<string | null> {
  const data = await tmdbGet<TmdbMovieReleaseDates>(`/movie/${movieId}/release_dates`);
  return extractSpainTheatricalReleaseDate(data);
}

async function fetchSpainProviderNames(showId: number): Promise<string[]> {
  const data = await tmdbGet<TmdbWatchProviders>(`/tv/${showId}/watch/providers`);
  return extractSpainProviderNames(data);
}

function passesQualityBar(
  item: { vote_count?: number; vote_average?: number },
  minVotes: number
): boolean {
  return (
    (item.vote_count ?? 0) >= minVotes &&
    (item.vote_average ?? 0) >= MIN_VOTE_AVERAGE
  );
}

function pickTopScored(
  items: ScoredEvent[],
  limit: number
): TmdbCronEvent[] {
  return [...items]
    .filter((item) => item.score >= MIN_BUZZ_SCORE)
    .sort((a, b) => b.score - a.score || a.event.date.localeCompare(b.event.date))
    .slice(0, limit)
    .map((item) => item.event);
}

async function fetchTrendingRank(
  mediaType: "movie" | "tv"
): Promise<Map<number, number>> {
  const data = await tmdbGet<{ results?: { id: number }[] }>(
    `/trending/${mediaType}/week`
  );
  const rank = new Map<number, number>();
  (data?.results ?? []).forEach((item, index) => {
    if (item.id) rank.set(item.id, index);
  });
  return rank;
}

async function fetchTopMovies(
  dateFrom: string,
  dateTo: string,
  trendingRank: Map<number, number>
): Promise<TmdbCronEvent[]> {
  const data = await tmdbGet<{ results?: TmdbItem[] }>("/discover/movie", {
    region: "ES",
    "primary_release_date.gte": dateFrom,
    "primary_release_date.lte": dateTo,
    sort_by: "popularity.desc",
    "vote_count.gte": String(MIN_MOVIE_VOTES),
    "vote_average.gte": String(MIN_VOTE_AVERAGE),
    page: "1",
  });

  const scored: ScoredEvent[] = [];

  for (const movie of data?.results ?? []) {
    if (!movie.id || !movie.release_date) continue;
    if (movie.release_date < dateFrom || movie.release_date > dateTo) continue;
    if (!passesQualityBar(movie, MIN_MOVIE_VOTES)) continue;

    const title = movie.title?.trim() || movie.original_title?.trim();
    if (!title) continue;

    const score = tmdbBuzzScore({
      popularity: movie.popularity,
      vote_count: movie.vote_count,
      vote_average: movie.vote_average,
      trendingRank: trendingRank.get(movie.id),
    });

    scored.push({
      score,
      event: {
        external_id: `tmdb_movie_${movie.id}`,
        title,
        date: movie.release_date,
        sport: "cine",
        category: "cine",
        competition: trendingRank.has(movie.id)
          ? "Estreno top · Cines"
          : "Estreno en cines",
        platform: defaultPlatformForMovie(),
        source: encodeTmdbSource(movie.poster_path, score),
      },
    });
  }

  return pickTopScored(scored, TMDB_MAX_MOVIES_WEEK);
}

async function fetchEditorialMovies(
  dateFrom: string,
  dateTo: string,
  trendingRank: Map<number, number>
): Promise<TmdbCronEvent[]> {
  const events: TmdbCronEvent[] = [];
  const today = toMadridDateKey(new Date());
  const curatedGraceStart = addDaysToDateKey(today, -21);
  const curatedGraceEnd = addDaysToDateKey(today, 14);

  for (const curated of CURATED_MOVIES) {
    if (
      curated.releaseDate < curatedGraceStart ||
      curated.releaseDate > curatedGraceEnd
    ) {
      continue;
    }

    const detail = await tmdbGet<TmdbItem>(`/movie/${curated.tmdbId}`);
    if (!detail) continue;

    const title =
      detail.title?.trim() || detail.original_title?.trim() || curated.title;

    const spainRelease =
      (await fetchSpainMovieReleaseDate(curated.tmdbId)) ?? curated.releaseDate;

    const score =
      tmdbBuzzScore({
        popularity: detail.popularity,
        vote_count: detail.vote_count,
        vote_average: detail.vote_average,
        trendingRank: trendingRank.get(curated.tmdbId),
      }) + curated.priority;

    events.push({
      external_id: `tmdb_movie_${curated.tmdbId}`,
      title,
      date: spainRelease,
      sport: "cine",
      category: "cine",
      competition:
        curated.competition ??
        (trendingRank.has(curated.tmdbId)
          ? "Estreno top · Cines"
          : "Estreno en cines"),
      platform: defaultPlatformForMovie(),
      source: encodeTmdbSource(detail.poster_path, score),
    });
  }

  return events;
}

function mergeMoviesByExternalId(...lists: TmdbCronEvent[][]): TmdbCronEvent[] {
  const byId = new Map<string, TmdbCronEvent>();
  for (const list of lists) {
    for (const event of list) byId.set(event.external_id, event);
  }
  return [...byId.values()];
}

async function buildSeriesEvent(
  showId: number,
  dateFrom: string,
  dateTo: string,
  trendingRank: number | undefined,
  seen: Set<string>,
  options?: { skipQualityBar?: boolean }
): Promise<ScoredEvent | null> {
  const [detail, providerNames] = await Promise.all([
    tmdbGet<TmdbShowDetail>(`/tv/${showId}`),
    fetchSpainProviderNames(showId),
  ]);
  if (!detail) return null;
  if (!options?.skipQualityBar && !passesQualityBar(detail, MIN_TV_VOTES)) {
    return null;
  }

  const next = detail.next_episode_to_air;
  const tmdbAirDate = next?.air_date;
  if (!tmdbAirDate) return null;

  const showName = detail.name?.trim();
  if (!showName) return null;
  if (isExcludedUsTvTitle(showName)) return null;

  const season = next?.season_number ?? 0;
  const episode = next?.episode_number ?? 0;

  const schedule = resolveSpainEpisodeSchedule({
    tmdbShowId: showId,
    tmdbAirDate,
    season,
    episode,
    originCountries: detail.origin_country,
    networkNames: detail.networks?.map((network) => network.name ?? ""),
    providerNames,
  });

  if (schedule.date < dateFrom || schedule.date > dateTo) return null;

  const dedupeKey = `${showId}_${schedule.date}_s${season}e${episode}`;
  if (seen.has(dedupeKey)) return null;
  seen.add(dedupeKey);

  const title = formatSeriesEpisodeTitle(
    showName,
    season,
    episode,
    next?.name
  );

  const score = tmdbBuzzScore({
    popularity: detail.popularity,
    vote_count: detail.vote_count,
    vote_average: detail.vote_average,
    trendingRank,
  });

  return {
    score,
    event: {
      external_id: `tmdb_tv_${showId}_${schedule.date}_s${season}e${episode}`,
      title,
      date: schedule.date,
      time: schedule.time,
      sport: "series",
      category: "cine",
      competition: seriesCompetitionLabel(season, episode, trendingRank),
      platform: schedule.platform,
      source: encodeTmdbSource(detail.poster_path, score),
    },
  };
}

async function fetchTopSeries(
  dateFrom: string,
  dateTo: string,
  trendingRank: Map<number, number>
): Promise<TmdbCronEvent[]> {
  const scored: ScoredEvent[] = [];
  const seen = new Set<string>();

  const candidates = [...trendingRank.entries()]
    .sort((a, b) => a[1] - b[1])
    .slice(0, 25);

  for (const [showId, rank] of candidates) {
    const built = await buildSeriesEvent(showId, dateFrom, dateTo, rank, seen);
    if (built) scored.push(built);
  }

  return pickTopScored(scored, TMDB_MAX_SERIES_WEEK);
}

async function fetchEditorialSeries(
  dateFrom: string,
  dateTo: string,
  trendingRank: Map<number, number>
): Promise<TmdbCronEvent[]> {
  const events: TmdbCronEvent[] = [];
  const seen = new Set<string>();

  for (const showId of EDITORIAL_TV_TMDB_IDS) {
    const built = await buildSeriesEvent(
      showId,
      dateFrom,
      dateTo,
      trendingRank.get(showId),
      seen,
      { skipQualityBar: true }
    );
    if (built) events.push(built.event);
  }

  return events;
}

function mergeSeriesByExternalId(...lists: TmdbCronEvent[][]): TmdbCronEvent[] {
  const byId = new Map<string, TmdbCronEvent>();
  for (const list of lists) {
    for (const event of list) byId.set(event.external_id, event);
  }
  return [...byId.values()];
}

export async function fetchTmdbEventsForWeek(
  dayCount = 7
): Promise<{ movies: TmdbCronEvent[]; series: TmdbCronEvent[]; error?: string }> {
  const apiKey = getTmdbApiKey();
  if (!apiKey) {
    return { movies: [], series: [], error: "TMDB_API_KEY missing" };
  }

  const dates = getMadridWeekDates(dayCount);
  const dateFrom = dates[0];
  const dateTo = dates[dates.length - 1];

  const [movieTrending, tvTrending] = await Promise.all([
    fetchTrendingRank("movie"),
    fetchTrendingRank("tv"),
  ]);

  const [discoveredMovies, editorialMovies, trendingSeries, editorialSeries] =
    await Promise.all([
      fetchTopMovies(dateFrom, dateTo, movieTrending),
      fetchEditorialMovies(dateFrom, dateTo, movieTrending),
      fetchTopSeries(dateFrom, dateTo, tvTrending),
      fetchEditorialSeries(dateFrom, dateTo, tvTrending),
    ]);

  const movies = mergeMoviesByExternalId(editorialMovies, discoveredMovies);
  const series = mergeSeriesByExternalId(trendingSeries, editorialSeries);

  return { movies, series };
}

/** Limita cine/series visibles al filtrar (solo lo más top por día) */
export function capTopMediaEvents(events: EventRowLike[]): EventRowLike[] {
  const sorted = [...events].sort(
    (a, b) =>
      mediaSortScore(b) - mediaSortScore(a) ||
      (a.time ?? "").localeCompare(b.time ?? "")
  );

  let cine = 0;
  let series = 0;
  const out: EventRowLike[] = [];

  for (const event of sorted) {
    if (event.sport === "cine") {
      if (cine >= TMDB_MAX_MEDIA_PER_DAY) continue;
      cine++;
    } else if (event.sport === "series") {
      if (series >= TMDB_MAX_MEDIA_PER_DAY) continue;
      series++;
    }
    out.push(event);
  }

  return out;
}

type EventRowLike = {
  sport?: string | null;
  time?: string | null;
  source?: string | null;
  popularity?: number;
};

function mediaSortScore(e: EventRowLike): number {
  const buzz = parseTmdbBuzzScore(e.source);
  if (buzz > 0) return buzz;
  return e.popularity ?? 0;
}
