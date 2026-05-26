import { getMadridWeekDates } from "./madrid-time";
import { SPANISH_TV_FLAGSHIP } from "./spanish-tv-curated";
import { encodeTmdbSource, getTmdbApiKey, tmdbBuzzScore } from "./tmdb";

const TMDB_BASE = "https://api.themoviedb.org/3";
const REALITY_GENRE_ID = "10764";

export const TMDB_MAX_REALITY_WEEK = 10;

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

type SearchItem = {
  id: number;
  name?: string;
  popularity?: number;
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

function defaultPlatform(
  networks?: { name?: string }[],
  fallback?: string
): string {
  const name = networks?.[0]?.name?.trim();
  if (name) return `${name} · TV y streaming`;
  return fallback ?? "TV y streaming";
}

function eventFromShow(
  showId: number,
  detail: ShowDetail,
  item: DiscoverItem | SearchItem,
  curated?: (typeof SPANISH_TV_FLAGSHIP)[number]
): RealityCronEvent | null {
  const next = detail.next_episode_to_air;
  const airDate = next?.air_date;
  if (!airDate) return null;

  const showName = detail.name?.trim() || item.name?.trim();
  if (!showName) return null;

  const season = next?.season_number ?? 0;
  const episode = next?.episode_number ?? 0;
  const epLabel = season && episode ? `T${season}E${episode}` : null;
  const epName = next?.name?.trim();
  const title = epLabel
    ? epName
      ? `${showName} — ${epLabel}: ${epName}`
      : `${showName} — ${epLabel}`
    : showName;

  const score = tmdbBuzzScore({
    popularity: detail.popularity ?? item.popularity,
    vote_count: detail.vote_count ?? ("vote_count" in item ? item.vote_count : undefined),
    vote_average: detail.vote_average ?? ("vote_average" in item ? item.vote_average : undefined),
  });

  const curatedBonus = curated ? curated.priority : 0;

  return {
    external_id: `tmdb_tv_reality_${showId}_${airDate}_s${season}e${episode}`,
    title,
    date: airDate,
    time: "22:00",
    sport: "tv",
    category: "tv",
    competition: curated?.competition ?? "Reality · Nuevo episodio",
    platform: defaultPlatform(detail.networks, curated?.platform),
    source: `${encodeTmdbSource(detail.poster_path ?? item.poster_path, score + curatedBonus)}|curated:${curated?.id ?? "discover"}`,
  };
}

async function fetchShowEventsForIds(
  ids: number[],
  dateFrom: string,
  dateTo: string,
  curated?: (typeof SPANISH_TV_FLAGSHIP)[number]
): Promise<RealityCronEvent[]> {
  const events: RealityCronEvent[] = [];

  for (const showId of ids) {
    const detail = await tmdbGet<ShowDetail>(`/tv/${showId}`);
    if (!detail) continue;

    const airDate = detail.next_episode_to_air?.air_date;
    if (!airDate || airDate < dateFrom || airDate > dateTo) continue;

    const event = eventFromShow(
      showId,
      detail,
      { id: showId, name: detail.name, popularity: detail.popularity },
      curated
    );
    if (event) events.push(event);
  }

  return events;
}

async function fetchCuratedSpanishTvEvents(
  dateFrom: string,
  dateTo: string
): Promise<RealityCronEvent[]> {
  const events: RealityCronEvent[] = [];
  const seenShows = new Set<number>();

  for (const curated of SPANISH_TV_FLAGSHIP) {
    const search = await tmdbGet<{ results?: SearchItem[] }>("/search/tv", {
      query: curated.search,
      include_adult: "false",
    });

    const match =
      search?.results?.find((item) =>
        curated.patterns.some((pattern) => pattern.test(item.name ?? ""))
      ) ?? search?.results?.[0];

    if (!match?.id || seenShows.has(match.id)) continue;
    seenShows.add(match.id);

    const showEvents = await fetchShowEventsForIds(
      [match.id],
      dateFrom,
      dateTo,
      curated
    );
    events.push(...showEvents);
  }

  return events;
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

  const [curatedEvents, discover] = await Promise.all([
    fetchCuratedSpanishTvEvents(dateFrom, dateTo),
    tmdbGet<{ results?: DiscoverItem[] }>("/discover/tv", {
      with_genres: REALITY_GENRE_ID,
      watch_region: "ES",
      sort_by: "popularity.desc",
      "vote_count.gte": "20",
      page: "1",
    }),
  ]);

  const map = new Map<string, RealityCronEvent>();
  for (const event of curatedEvents) {
    map.set(event.external_id, event);
  }

  const candidates = (discover?.results ?? []).slice(0, 24);

  for (const item of candidates) {
    if (!item.id) continue;
    const detail = await tmdbGet<ShowDetail>(`/tv/${item.id}`);
    if (!detail) continue;

    const event = eventFromShow(item.id, detail, item);
    if (!event) continue;
    if (event.date < dateFrom || event.date > dateTo) continue;

    if (!map.has(event.external_id)) {
      map.set(event.external_id, event);
    }
  }

  return {
    events: [...map.values()]
      .sort(
        (a, b) =>
          (parseInt(b.source.match(/\|buzz:(\d+)/)?.[1] ?? "0", 10) || 0) -
            (parseInt(a.source.match(/\|buzz:(\d+)/)?.[1] ?? "0", 10) || 0) ||
          a.date.localeCompare(b.date)
      )
      .slice(0, TMDB_MAX_REALITY_WEEK),
  };
}
