import { getMadridWeekDates } from "./madrid-time";
import { encodeTmdbSource, getTmdbApiKey, tmdbBuzzScore } from "./tmdb";

const TMDB_BASE = "https://api.themoviedb.org/3";
const REALITY_GENRE_ID = "10764";

export const TMDB_MAX_REALITY_WEEK = 6;

export type RealityCronEvent = {
  external_id: string;
  title: string;
  date: string;
  time: string;
  sport: "tv";
  category: "tv";
  competition: string;
  platform: string;
  source: string;
};

type DiscoverItem = {
  id: number;
  name?: string;
  popularity?: number;
  vote_count?: number;
  vote_average?: number;
  poster_path?: string | null;
};

type ShowDetail = {
  id: number;
  name?: string;
  poster_path?: string | null;
  vote_count?: number;
  vote_average?: number;
  popularity?: number;
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
  if (!res.ok) return null;
  return res.json() as Promise<T>;
}

function defaultPlatform(networks?: { name?: string }[]): string {
  const name = networks?.[0]?.name?.trim();
  return name ? `${name} · TV y streaming` : "TV y streaming";
}

export async function fetchRealityCronEvents(
  dayCount = 7
): Promise<{ events: RealityCronEvent[]; error?: string }> {
  const apiKey = getTmdbApiKey();
  if (!apiKey) {
    return { events: [], error: "TMDB_API_KEY missing" };
  }

  const dates = getMadridWeekDates(dayCount);
  const dateFrom = dates[0];
  const dateTo = dates[dates.length - 1];

  const discover = await tmdbGet<{ results?: DiscoverItem[] }>("/discover/tv", {
    with_genres: REALITY_GENRE_ID,
    watch_region: "ES",
    sort_by: "popularity.desc",
    "vote_count.gte": "20",
    page: "1",
  });

  const candidates = (discover?.results ?? []).slice(0, 24);
  const events: RealityCronEvent[] = [];

  for (const item of candidates) {
    if (!item.id) continue;
    const detail = await tmdbGet<ShowDetail>(`/tv/${item.id}`);
    if (!detail) continue;

    const next = detail.next_episode_to_air;
    const airDate = next?.air_date;
    if (!airDate || airDate < dateFrom || airDate > dateTo) continue;

    const showName = detail.name?.trim() || item.name?.trim();
    if (!showName) continue;

    const season = next?.season_number ?? 0;
    const episode = next?.episode_number ?? 0;
    const epLabel =
      season && episode ? `T${season}E${episode}` : null;
    const epName = next?.name?.trim();
    const title = epLabel
      ? epName
        ? `${showName} — ${epLabel}: ${epName}`
        : `${showName} — ${epLabel}`
      : showName;

    const score = tmdbBuzzScore({
      popularity: detail.popularity ?? item.popularity,
      vote_count: detail.vote_count ?? item.vote_count,
      vote_average: detail.vote_average ?? item.vote_average,
    });

    events.push({
      external_id: `tmdb_tv_reality_${item.id}_${airDate}_s${season}e${episode}`,
      title,
      date: airDate,
      time: "22:00",
      sport: "tv",
      category: "tv",
      competition: "Reality · Nuevo episodio",
      platform: defaultPlatform(detail.networks),
      source: encodeTmdbSource(detail.poster_path ?? item.poster_path, score),
    });
  }

  return {
    events: events
      .sort(
        (a, b) =>
          (parseInt(b.source.match(/\|buzz:(\d+)/)?.[1] ?? "0", 10) || 0) -
            (parseInt(a.source.match(/\|buzz:(\d+)/)?.[1] ?? "0", 10) || 0) ||
          a.date.localeCompare(b.date)
      )
      .slice(0, TMDB_MAX_REALITY_WEEK),
  };
}
