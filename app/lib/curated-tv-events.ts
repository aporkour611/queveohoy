import type { EventRow } from "../components/types";
import { addDaysToDateKey, madridDateTimeToUtc } from "./madrid-time";
import {
  matchesSpanishTvFlagship,
  SPANISH_TV_FLAGSHIP,
  type SpanishTvShow,
} from "./spanish-tv-curated";
import { encodeTmdbSource } from "./tmdb";
import { parseTmdbPoster } from "./tmdb-client";

/** 1 = lunes … 7 = domingo (ISO). */
export function isoWeekdayFromDateKey(dateKey: string): number {
  const day = madridDateTimeToUtc(dateKey, "12:00").getUTCDay();
  return day === 0 ? 7 : day;
}

function syntheticEventId(showId: string, dateKey: string): number {
  let hash = 0;
  for (const char of `${showId}:${dateKey}`) {
    hash = (hash * 31 + char.charCodeAt(0)) | 0;
  }
  return hash > 0 ? -hash : hash;
}

function collectFlagshipPosterSources(events: Iterable<EventRow>): Map<string, string> {
  const sources = new Map<string, string>();

  for (const event of events) {
    if (event.sport !== "tv" || !event.source) continue;

    const show = matchesSpanishTvFlagship(event);
    if (!show || sources.has(show.id)) continue;
    if (!parseTmdbPoster(event.source, "thumb")) continue;

    sources.set(show.id, event.source);
  }

  return sources;
}

function resolveShowSource(
  show: SpanishTvShow,
  posterSources: Map<string, string>
): string {
  const inherited = posterSources.get(show.id);
  if (inherited) return inherited;

  if (show.posterPath) {
    return encodeTmdbSource(show.posterPath, show.priority);
  }

  return encodeTmdbSource(null, show.priority);
}

function findShowEventOnDate(
  events: Iterable<EventRow>,
  show: SpanishTvShow,
  dateKey: string
): EventRow | undefined {
  for (const event of events) {
    if (event.date !== dateKey || event.sport !== "tv") continue;
    const blob = `${event.title ?? ""} ${event.competition ?? ""}`;
    if (show.patterns.some((pattern) => pattern.test(blob))) return event;
  }
  return undefined;
}

function buildSyntheticTvEvent(
  show: SpanishTvShow,
  dateKey: string,
  posterSources: Map<string, string>
): EventRow {
  const externalId = `curated_tv_${show.id}_${dateKey}`;
  return {
    id: syntheticEventId(show.id, dateKey),
    external_id: externalId,
    title: show.search,
    date: dateKey,
    time: show.airTime ?? "22:00",
    sport: "tv",
    competition: show.competition,
    platform: show.platform,
    source: resolveShowSource(show, posterSources),
  };
}

function normalizeShowEvent(
  event: EventRow,
  show: SpanishTvShow,
  posterSources: Map<string, string>
): EventRow {
  const source = parseTmdbPoster(event.source, "thumb")
    ? event.source!
    : resolveShowSource(show, posterSources);

  return {
    ...event,
    time: show.airTime ?? event.time ?? "22:00",
    sport: "tv",
    competition: event.competition?.trim() || show.competition,
    platform: event.platform?.trim() || show.platform,
    source,
  };
}

/** Rellena realities con horario fijo (lun/mar…) en la ventana de 7 días. */
export function mergeCuratedSpanishTvEvents(
  events: EventRow[],
  todayKey: string,
  windowDays = 7
): EventRow[] {
  const merged = new Map<string, EventRow>();

  for (const event of events) {
    const key = event.external_id ?? String(event.id);
    merged.set(key, event);
  }

  const weekEnd = addDaysToDateKey(todayKey, windowDays - 1);
  const posterSources = collectFlagshipPosterSources(merged.values());

  for (const show of SPANISH_TV_FLAGSHIP) {
    if (!show.airWeekdays?.length) continue;

    for (let offset = 0; offset < windowDays; offset++) {
      const dateKey = addDaysToDateKey(todayKey, offset);
      if (dateKey > weekEnd) break;
      if (!show.airWeekdays.includes(isoWeekdayFromDateKey(dateKey))) continue;

      const existing = findShowEventOnDate(merged.values(), show, dateKey);
      const externalId =
        existing?.external_id ?? `curated_tv_${show.id}_${dateKey}`;

      merged.set(
        externalId,
        existing
          ? normalizeShowEvent(existing, show, posterSources)
          : buildSyntheticTvEvent(show, dateKey, posterSources)
      );
    }
  }

  return [...merged.values()];
}

export function isFlagshipSpanishTvEvent(event: EventRow): boolean {
  return matchesSpanishTvFlagship(event) !== null;
}

/** Realities con emisión fija semanal (p. ej. La Isla, lun/mar). */
export function isRecurringFlagshipSpanishTvEvent(event: EventRow): boolean {
  const show = matchesSpanishTvFlagship(event);
  return Boolean(show?.airWeekdays?.length);
}
