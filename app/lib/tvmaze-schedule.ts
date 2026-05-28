import { addDaysToDateKey, getMadridWeekDates } from "./madrid-time";
import { encodeTmdbSource } from "./tmdb-client";
import {
  matchSpanishTvByTvmazeShow,
  matchSpanishTvShowName,
  type SpanishTvShow,
} from "./spanish-tv-curated";
import { fetchJsonWithTimeout } from "./fetch-json";

const TVMAZE_BASE = "https://api.tvmaze.com";

export type TvmazeCronEvent = {
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

type TvmazeScheduleEpisode = {
  id?: number;
  name?: string;
  season?: number;
  number?: number;
  airdate?: string;
  airtime?: string;
  show?: {
    id?: number;
    name?: string;
    image?: { medium?: string | null } | null;
  };
};

function normalizeAirTime(airtime?: string | null): string {
  const raw = airtime?.trim();
  if (!raw) return "22:00";
  if (/^\d{2}:\d{2}$/.test(raw)) return raw;
  if (/^\d{2}:\d{2}:\d{2}$/.test(raw)) return raw.slice(0, 5);
  return "22:00";
}

function buildEpisodeTitle(
  show: SpanishTvShow,
  season: number,
  episode: number,
  episodeName?: string | null
): string {
  const epLabel = season && episode ? `T${season}E${episode}` : null;
  const epName = episodeName?.trim();
  if (epLabel && epName) return `${show.search} — ${epLabel}: ${epName}`;
  if (epLabel) return `${show.search} — ${epLabel}`;
  return show.search;
}

function buildTvmazeEvent(
  show: SpanishTvShow,
  episode: TvmazeScheduleEpisode
): TvmazeCronEvent | null {
  const date = episode.airdate?.trim();
  if (!date) return null;

  const season = episode.season ?? 0;
  const number = episode.number ?? 0;
  const externalId = `tvmaze_${show.id}_${date}_s${season}e${number || episode.id || 0}`;

  return {
    external_id: externalId,
    title: buildEpisodeTitle(show, season, number, episode.name),
    date,
    time: show.airTime ?? normalizeAirTime(episode.airtime),
    sport: "tv",
    category: "tv",
    competition: show.competition,
    platform: show.platform,
    source: encodeTmdbSource(show.posterPath ?? null, show.priority),
  };
}

function resolveShowForEpisode(
  episode: TvmazeScheduleEpisode
): SpanishTvShow | null {
  const showId = episode.show?.id;
  if (showId) {
    const byId = matchSpanishTvByTvmazeShow(showId);
    if (byId) return byId;
  }
  return matchSpanishTvShowName(episode.show?.name);
}

async function fetchScheduleDay(
  dateKey: string
): Promise<TvmazeScheduleEpisode[]> {
  const result = await fetchJsonWithTimeout<TvmazeScheduleEpisode[]>(
    `${TVMAZE_BASE}/schedule?country=ES&date=${dateKey}`,
    { next: { revalidate: 0 } },
    15_000
  );
  if (!result.ok || !Array.isArray(result.data)) return [];
  return result.data;
}

/** Episodios TV lineal España (TVmaze) para programas flagship curados. */
export async function fetchTvmazeSpainEvents(
  dayCount = 7
): Promise<{ events: TvmazeCronEvent[]; error?: string }> {
  const dates = getMadridWeekDates(dayCount);
  const dateFrom = dates[0];
  const dateTo = dates[dates.length - 1];
  const byExternalId = new Map<string, TvmazeCronEvent>();
  const errors: string[] = [];

  for (let offset = 0; offset < dayCount; offset++) {
    const dateKey = addDaysToDateKey(dateFrom, offset);
    if (dateKey > dateTo) break;

    try {
      const episodes = await fetchScheduleDay(dateKey);
      for (const episode of episodes) {
        const show = resolveShowForEpisode(episode);
        if (!show) continue;

        const event = buildTvmazeEvent(show, episode);
        if (!event) continue;
        if (event.date < dateFrom || event.date > dateTo) continue;

        byExternalId.set(event.external_id, event);
      }
    } catch (err) {
      errors.push(`${dateKey}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return {
    events: [...byExternalId.values()],
    error: errors.length ? errors.join("; ") : undefined,
  };
}
