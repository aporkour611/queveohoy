import type { EventRow } from "../components/types";
import { addDaysToDateKey } from "./madrid-time";
import { formatSeriesEpisodeTitle } from "./series-display";
import {
  CURATED_SERIES_EPISODES,
  type CuratedSeriesEpisode,
} from "./series-curated";
import { encodeTmdbSource } from "./tmdb";
import { parseTmdbBuzzScore, parseTmdbPoster } from "./tmdb-client";

export function curatedSeriesExternalId(episode: CuratedSeriesEpisode): string {
  return `tmdb_tv_${episode.tmdbId}_${episode.airDate}_s${episode.season}e${episode.episode}`;
}

function syntheticSeriesId(episode: CuratedSeriesEpisode): number {
  let hash = 0;
  for (const char of curatedSeriesExternalId(episode)) {
    hash = (hash * 31 + char.charCodeAt(0)) | 0;
  }
  return hash > 0 ? -hash : hash;
}

function curatedSeriesSource(
  episode: CuratedSeriesEpisode,
  existing?: EventRow
): string {
  const buzz = parseTmdbBuzzScore(existing?.source) || episode.priority;

  if (episode.posterPath) {
    return encodeTmdbSource(episode.posterPath, buzz);
  }

  if (existing?.source?.trim() && parseTmdbPoster(existing.source, "poster")) {
    return existing.source.trim();
  }

  return encodeTmdbSource(null, buzz);
}

function buildCuratedSeriesEvent(
  episode: CuratedSeriesEpisode,
  existing?: EventRow
): EventRow {
  const externalId = curatedSeriesExternalId(episode);
  return {
    id: existing?.id ?? syntheticSeriesId(episode),
    external_id: externalId,
    title: formatSeriesEpisodeTitle(
      episode.title,
      episode.season,
      episode.episode,
      episode.episodeName
    ),
    date: episode.airDate,
    time: episode.airTime ?? existing?.time ?? "22:00",
    sport: "series",
    competition: episode.competition ?? "Nuevo episodio",
    platform: episode.platform,
    source: curatedSeriesSource(episode, existing),
  };
}

function findExistingCuratedSeries(
  events: Iterable<EventRow>,
  episode: CuratedSeriesEpisode
): EventRow | undefined {
  const externalId = curatedSeriesExternalId(episode);

  for (const event of events) {
    if (event.external_id === externalId) return event;
    if (event.sport !== "series") continue;

    const showTitle = (event.title ?? "").split(" — ")[0]?.trim() ?? "";
    if (
      episode.patterns.some((pattern) => pattern.test(showTitle)) &&
      event.date === episode.airDate
    ) {
      return event;
    }
  }

  return undefined;
}

/** Filas TMDB con fecha US (p. ej. domingo) cuando el estreno España es otro día. */
export function shouldSuppressCuratedSeriesStaleEvent(event: EventRow): boolean {
  if (event.sport !== "series") return false;

  const episode = CURATED_SERIES_EPISODES.find((item) => {
    if (event.external_id === curatedSeriesExternalId(item)) return true;

    const showTitle = (event.title ?? "").split(" — ")[0]?.trim() ?? "";
    if (!item.patterns.some((pattern) => pattern.test(showTitle))) return false;

    const meta = event.title?.match(/\bT(\d+)E(\d+)\b/i);
    if (!meta) return item.patterns.some((pattern) => pattern.test(showTitle));

    return (
      Number(meta[1]) === item.season && Number(meta[2]) === item.episode
    );
  });

  if (!episode) return false;
  if (event.external_id === curatedSeriesExternalId(episode)) return false;

  return event.date !== episode.airDate;
}

export function stripStaleCuratedSeriesEvents(events: EventRow[]): EventRow[] {
  return events.filter((event) => !shouldSuppressCuratedSeriesStaleEvent(event));
}

/** Asegura episodios editoriales (FROM, Euphoria…) en Destacados y feed. */
export function mergeCuratedSeriesEvents(
  events: EventRow[],
  todayKey: string,
  windowDays = 7
): EventRow[] {
  const merged = new Map<string, EventRow>();

  for (const event of stripStaleCuratedSeriesEvents(events)) {
    const key = event.external_id ?? String(event.id);
    merged.set(key, event);
  }

  const weekEnd = addDaysToDateKey(todayKey, windowDays - 1);

  for (const episode of CURATED_SERIES_EPISODES) {
    if (episode.airDate < todayKey || episode.airDate > weekEnd) continue;

    const existing = findExistingCuratedSeries(merged.values(), episode);
    const externalId = curatedSeriesExternalId(episode);
    merged.set(externalId, buildCuratedSeriesEvent(episode, existing));
  }

  return [...merged.values()];
}

export function isCuratedSeriesEvent(event: EventRow): boolean {
  if (event.sport !== "series") return false;
  if (
    CURATED_SERIES_EPISODES.some(
      (episode) => event.external_id === curatedSeriesExternalId(episode)
    )
  ) {
    return true;
  }

  const showTitle = (event.title ?? "").split(" — ")[0]?.trim() ?? "";
  return CURATED_SERIES_EPISODES.some((episode) =>
    episode.patterns.some((pattern) => pattern.test(showTitle))
  );
}

export function isUpcomingCuratedSeries(
  event: EventRow,
  todayKey: string
): boolean {
  const episode = CURATED_SERIES_EPISODES.find(
    (item) => event.external_id === curatedSeriesExternalId(item)
  );
  if (!episode) return false;
  return episode.airDate >= todayKey;
}
