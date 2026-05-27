import { getMadridWeekDates, addDaysToDateKey } from "./madrid-time";
import type { SpanishTvShow } from "./spanish-tv-curated";
import { SPANISH_TV_FLAGSHIP } from "./spanish-tv-curated";
import { isoWeekdayFromDateKey } from "./curated-tv-events";
import { encodeTmdbSource, getTmdbApiKey, tmdbBuzzScore } from "./tmdb";
import { isExcludedUsTvTitle } from "./spain-latam-media";

const TMDB_BASE = "https://api.themoviedb.org/3";
const REALITY_GENRE_ID = "10764";
const DEFAULT_REALITY_AIR_TIME = "22:00";

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
  last_episode_to_air?: {
    air_date?: string;
    episode_number?: number;
    season_number?: number;
    name?: string;
  } | null;
};

type SeasonEpisode = {
  episode_number?: number;
  season_number?: number;
  name?: string;
  air_date?: string | null;
};

type SeasonDetail = {
  episodes?: SeasonEpisode[];
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

function buildRealityTitle(
  showName: string,
  season: number,
  episode: number,
  episodeName?: string | null
): string {
  const epLabel = season && episode ? `T${season}E${episode}` : null;
  const epName = episodeName?.trim();
  if (epLabel && epName) return `${showName} — ${epLabel}: ${epName}`;
  if (epLabel) return `${showName} — ${epLabel}`;
  return showName;
}

function buildRealityEvent(
  showId: number,
  detail: ShowDetail,
  item: DiscoverItem | SearchItem,
  curated: SpanishTvShow | undefined,
  airDate: string,
  season: number,
  episode: number,
  episodeName?: string | null
): RealityCronEvent {
  const showName = detail.name?.trim() || item.name?.trim() || "Reality";
  const score = tmdbBuzzScore({
    popularity: detail.popularity ?? item.popularity,
    vote_count:
      detail.vote_count ?? ("vote_count" in item ? item.vote_count : undefined),
    vote_average:
      detail.vote_average ??
      ("vote_average" in item ? item.vote_average : undefined),
  });
  const curatedBonus = curated?.priority ?? 0;

  return {
    external_id: `tmdb_tv_reality_${showId}_${airDate}_s${season}e${episode}`,
    title: buildRealityTitle(showName, season, episode, episodeName),
    date: airDate,
    time: curated?.airTime ?? DEFAULT_REALITY_AIR_TIME,
    sport: "tv",
    category: "tv",
    competition: curated?.competition ?? "Reality · Nuevo episodio",
    platform: defaultPlatform(detail.networks, curated?.platform),
    source: `${encodeTmdbSource(detail.poster_path ?? item.poster_path, score + curatedBonus)}|curated:${curated?.id ?? "discover"}`,
  };
}

function eventFromNextEpisode(
  showId: number,
  detail: ShowDetail,
  item: DiscoverItem | SearchItem,
  curated?: SpanishTvShow
): RealityCronEvent | null {
  const next = detail.next_episode_to_air;
  const airDate = next?.air_date;
  if (!airDate) return null;

  return buildRealityEvent(
    showId,
    detail,
    item,
    curated,
    airDate,
    next?.season_number ?? 0,
    next?.episode_number ?? 0,
    next?.name
  );
}

async function fetchSeasonEpisodesInRange(
  showId: number,
  seasonNumber: number,
  dateFrom: string,
  dateTo: string,
  detail: ShowDetail,
  item: DiscoverItem | SearchItem,
  curated?: SpanishTvShow
): Promise<RealityCronEvent[]> {
  const season = await tmdbGet<SeasonDetail>(
    `/tv/${showId}/season/${seasonNumber}`
  );
  if (!season?.episodes?.length) return [];

  const events: RealityCronEvent[] = [];

  for (const ep of season.episodes) {
    const airDate = ep.air_date ?? undefined;
    if (!airDate || airDate < dateFrom || airDate > dateTo) continue;

    events.push(
      buildRealityEvent(
        showId,
        detail,
        item,
        curated,
        airDate,
        ep.season_number ?? seasonNumber,
        ep.episode_number ?? 0,
        ep.name
      )
    );
  }

  return events;
}

async function resolveShowId(
  curated: SpanishTvShow
): Promise<{ id: number; item: SearchItem } | null> {
  if (curated.tmdbId) {
    return { id: curated.tmdbId, item: { id: curated.tmdbId } };
  }

  const search = await tmdbGet<{ results?: SearchItem[] }>("/search/tv", {
    query: curated.search,
    include_adult: "false",
  });

  const match =
    search?.results?.find((item) =>
      curated.patterns.some((pattern) => pattern.test(item.name ?? ""))
    ) ?? search?.results?.[0];

  if (!match?.id) return null;
  return { id: match.id, item: match };
}

function buildManualEvents(
  curated: SpanishTvShow,
  dateFrom: string,
  dateTo: string
): RealityCronEvent[] {
  if (!curated.manualSlots?.length) return [];

  return curated.manualSlots
    .filter((slot) => slot.date >= dateFrom && slot.date <= dateTo)
    .map((slot) => ({
      external_id: `manual_tv_${curated.id}_${slot.date}${
        slot.edition ? `_e${slot.edition}` : ""
      }`,
      title: slot.title ?? curated.search,
      date: slot.date,
      time: slot.time ?? curated.airTime ?? DEFAULT_REALITY_AIR_TIME,
      sport: "tv" as const,
      category: "tv" as const,
      competition: slot.edition
        ? `${curated.competition} · Edición ${slot.edition}`
        : curated.competition,
      platform: curated.platform,
      source: `manual|curated:${curated.id}|buzz:${curated.priority}`,
    }));
}

function fillWeekdayAirSlots(
  curated: SpanishTvShow,
  showId: number,
  detail: ShowDetail,
  item: DiscoverItem | SearchItem,
  dateFrom: string,
  dateTo: string,
  existing: RealityCronEvent[]
): RealityCronEvent[] {
  if (!curated.airWeekdays?.length) return existing;

  const byDate = new Map(existing.map((event) => [event.date, event]));
  const filled = [...existing];

  const season =
    detail.next_episode_to_air?.season_number ??
    detail.last_episode_to_air?.season_number ??
    0;
  const baseEpisode =
    detail.next_episode_to_air?.episode_number ??
    detail.last_episode_to_air?.episode_number ??
    0;

  let date = dateFrom;
  let slotIndex = 0;

  while (date <= dateTo) {
    if (
      curated.airWeekdays.includes(isoWeekdayFromDateKey(date)) &&
      !byDate.has(date)
    ) {
      const episode = baseEpisode > 0 ? baseEpisode + slotIndex : 0;
      filled.push(
        buildRealityEvent(
          showId,
          detail,
          item,
          curated,
          date,
          season,
          episode,
          null
        )
      );
      slotIndex += 1;
    }
    date = addDaysToDateKey(date, 1);
  }

  return filled;
}

async function fetchCuratedShowEvents(
  curated: SpanishTvShow,
  showId: number,
  item: SearchItem,
  dateFrom: string,
  dateTo: string
): Promise<RealityCronEvent[]> {
  const detail = await tmdbGet<ShowDetail>(`/tv/${showId}`);
  if (!detail) return [];

  const seasonNumber =
    detail.next_episode_to_air?.season_number ??
    detail.last_episode_to_air?.season_number;

  if (curated.tmdbId && seasonNumber) {
    const weekEpisodes = await fetchSeasonEpisodesInRange(
      showId,
      seasonNumber,
      dateFrom,
      dateTo,
      detail,
      item,
      curated
    );
    if (weekEpisodes.length > 0) {
      return fillWeekdayAirSlots(
        curated,
        showId,
        detail,
        item,
        dateFrom,
        dateTo,
        weekEpisodes
      );
    }
  }

  const next = eventFromNextEpisode(showId, detail, item, curated);
  const fallback =
    !next || next.date < dateFrom || next.date > dateTo ? [] : [next];
  return fillWeekdayAirSlots(
    curated,
    showId,
    detail,
    item,
    dateFrom,
    dateTo,
    fallback
  );
}

async function fetchCuratedSpanishTvEvents(
  dateFrom: string,
  dateTo: string
): Promise<RealityCronEvent[]> {
  const events: RealityCronEvent[] = [];
  const seenShows = new Set<number>();

  for (const curated of SPANISH_TV_FLAGSHIP) {
    if (curated.manualSlots?.length) {
      events.push(...buildManualEvents(curated, dateFrom, dateTo));
    }

    if (curated.tmdbId) {
      if (seenShows.has(curated.tmdbId)) continue;
      seenShows.add(curated.tmdbId);

      const showEvents = await fetchCuratedShowEvents(
        curated,
        curated.tmdbId,
        { id: curated.tmdbId },
        dateFrom,
        dateTo
      );
      events.push(...showEvents);
      continue;
    }

    if (curated.manualSlots?.length) continue;

    const resolved = await resolveShowId(curated);
    if (!resolved || seenShows.has(resolved.id)) continue;
    seenShows.add(resolved.id);

    const showEvents = await fetchCuratedShowEvents(
      curated,
      resolved.id,
      resolved.item,
      dateFrom,
      dateTo
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

  const discoverBudget = Math.max(0, TMDB_MAX_REALITY_WEEK - curatedEvents.length);
  const candidates = (discover?.results ?? []).slice(0, 24);
  let discoverAdded = 0;

  for (const item of candidates) {
    if (discoverAdded >= discoverBudget) break;
    if (!item.id) continue;

    const detail = await tmdbGet<ShowDetail>(`/tv/${item.id}`);
    if (!detail) continue;

    const showName = detail.name?.trim() || item.name?.trim() || "";
    if (isExcludedUsTvTitle(showName)) continue;

    const event = eventFromNextEpisode(item.id, detail, item);
    if (!event) continue;
    if (event.date < dateFrom || event.date > dateTo) continue;
    if (map.has(event.external_id)) continue;

    map.set(event.external_id, event);
    discoverAdded++;
  }

  return {
    events: [...map.values()].sort(
      (a, b) =>
        a.date.localeCompare(b.date) ||
        (parseInt(b.source.match(/\|buzz:(\d+)/)?.[1] ?? "0", 10) || 0) -
          (parseInt(a.source.match(/\|buzz:(\d+)/)?.[1] ?? "0", 10) || 0)
    ),
  };
}
