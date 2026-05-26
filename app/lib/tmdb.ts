import { getMadridWeekDates } from "./madrid-time";

const TMDB_BASE = "https://api.themoviedb.org/3";
const LOGO_PREFIX = "tmdb:poster:";

export type TmdbCronEvent = {
  external_id: string;
  title: string;
  date: string;
  time: string;
  sport: "cine" | "series";
  category: "cine";
  competition: string;
  platform: string;
  source: string;
};

export function getTmdbApiKey(): string | undefined {
  return process.env.TMDB_API_KEY?.trim();
}

export function encodeTmdbSource(posterPath?: string | null): string {
  const path = posterPath?.trim();
  if (!path) return "tmdb";
  return `${LOGO_PREFIX}${path}`;
}

export function parseTmdbPoster(source?: string | null): string | null {
  if (!source?.startsWith(LOGO_PREFIX)) return null;
  const path = source.slice(LOGO_PREFIX.length).trim();
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `https://image.tmdb.org/t/p/w185${path.startsWith("/") ? path : `/${path}`}`;
}

type TmdbPage<T> = {
  results?: T[];
};

type TmdbMovie = {
  id: number;
  title?: string;
  original_title?: string;
  release_date?: string;
  poster_path?: string | null;
  popularity?: number;
};

type TmdbShow = {
  id: number;
  name?: string;
  original_name?: string;
  poster_path?: string | null;
  popularity?: number;
};

type TmdbShowDetail = {
  id: number;
  name?: string;
  poster_path?: string | null;
  networks?: { name?: string }[];
  next_episode_to_air?: {
    air_date?: string;
    episode_number?: number;
    season_number?: number;
    name?: string;
  } | null;
};

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

function defaultPlatformForMovie(title: string): string {
  return "Cines";
}

function defaultPlatformForSeries(networks?: { name?: string }[]): string {
  const name = networks?.[0]?.name?.trim();
  return name ? `${name} · Streaming` : "TV y streaming";
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

  const movies: TmdbCronEvent[] = [];
  const series: TmdbCronEvent[] = [];

  const movieData = await tmdbGet<TmdbPage<TmdbMovie>>("/discover/movie", {
    region: "ES",
    "primary_release_date.gte": dateFrom,
    "primary_release_date.lte": dateTo,
    sort_by: "popularity.desc",
    "vote_count.gte": "5",
    page: "1",
  });

  for (const movie of movieData?.results ?? []) {
    if (!movie.id || !movie.release_date) continue;
    if (movie.release_date < dateFrom || movie.release_date > dateTo) continue;

    const title = movie.title?.trim() || movie.original_title?.trim();
    if (!title) continue;

    movies.push({
      external_id: `tmdb_movie_${movie.id}`,
      title,
      date: movie.release_date,
      time: "21:00",
      sport: "cine",
      category: "cine",
      competition: "Estreno en cines",
      platform: defaultPlatformForMovie(title),
      source: encodeTmdbSource(movie.poster_path),
    });
  }

  const tvData = await tmdbGet<TmdbPage<TmdbShow>>("/discover/tv", {
    "air_date.gte": dateFrom,
    "air_date.lte": dateTo,
    sort_by: "popularity.desc",
    "vote_count.gte": "10",
    page: "1",
  });

  const seenSeries = new Set<string>();

  for (const show of (tvData?.results ?? []).slice(0, 20)) {
    if (!show.id) continue;

    const detail = await tmdbGet<TmdbShowDetail>(`/tv/${show.id}`);
    const next = detail?.next_episode_to_air;
    const airDate = next?.air_date;
    if (!airDate || airDate < dateFrom || airDate > dateTo) continue;

    const dedupeKey = `${show.id}_${airDate}`;
    if (seenSeries.has(dedupeKey)) continue;
    seenSeries.add(dedupeKey);

    const showName =
      detail?.name?.trim() || show.name?.trim() || show.original_name?.trim();
    if (!showName) continue;

    const epLabel =
      next?.season_number && next?.episode_number
        ? `T${next.season_number}E${next.episode_number}`
        : null;
    const epName = next?.name?.trim();
    const title = epLabel
      ? epName
        ? `${showName} — ${epLabel}: ${epName}`
        : `${showName} — ${epLabel}`
      : showName;

    series.push({
      external_id: `tmdb_tv_${show.id}_${airDate}_s${next?.season_number ?? 0}e${next?.episode_number ?? 0}`,
      title,
      date: airDate,
      time: "22:00",
      sport: "series",
      category: "cine",
      competition: "Nuevo episodio",
      platform: defaultPlatformForSeries(detail?.networks),
      source: encodeTmdbSource(detail?.poster_path ?? show.poster_path),
    });
  }

  return { movies, series };
}
