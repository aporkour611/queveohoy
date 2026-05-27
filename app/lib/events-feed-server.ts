import type { EventRow } from "../components/types";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { FEED_REVALIDATE_SECONDS } from "./cache-config";
import { FEED_DAY_COUNT, FEED_EVENT_SELECT, normalizeFeedEvents } from "./events-feed";
import { HOME_SSR_DAY_COUNT } from "./home-feed-config";
import { CURATED_MOVIES } from "./movies-curated";
import { createClient } from "./supabase/server";
import {
  getEventsQueryDateRange,
  getEventsQueryDateRangeTight,
  getWeekDatesInZone,
  addDaysToDateKeyInZone,
  MADRID_TZ,
} from "./timezone";

const FEED_QUERY_TIMEOUT_MS = 25_000;

const CURATED_DESTACADOS_EXTERNAL_IDS = CURATED_MOVIES.map(
  (movie) => `tmdb_movie_${movie.tmdbId}`
);

function getDestacadosQueryDateRange(): { from: string; to: string } {
  const madridToday = getWeekDatesInZone(MADRID_TZ, 1)[0];
  return {
    from: addDaysToDateKeyInZone(madridToday, -21, MADRID_TZ),
    to: addDaysToDateKeyInZone(
      madridToday,
      FEED_DAY_COUNT + 2,
      MADRID_TZ
    ),
  };
}

async function queryDestacadosEvents(): Promise<{
  events: EventRow[];
  error: string | null;
}> {
  const { from, to } = getDestacadosQueryDateRange();
  const supabase = createClient();

  const [rangeResult, curatedResult] = await Promise.all([
    supabase
      .from("events")
      .select(FEED_EVENT_SELECT)
      .gte("date", from)
      .lte("date", to)
      .order("date", { ascending: true })
      .order("time", { ascending: true }),
    supabase
      .from("events")
      .select(FEED_EVENT_SELECT)
      .in("external_id", CURATED_DESTACADOS_EXTERNAL_IDS),
  ]);

  if (rangeResult.error) {
    return { events: [], error: rangeResult.error.message };
  }

  const merged = new Map<number, EventRow>();
  for (const row of [
    ...((rangeResult.data ?? []) as EventRow[]),
    ...((curatedResult.data ?? []) as EventRow[]),
  ]) {
    merged.set(row.id, row);
  }

  return {
    events: normalizeFeedEvents([...merged.values()]),
    error: curatedResult.error?.message ?? null,
  };
}

async function loadDestacadosEvents(): Promise<{
  events: EventRow[];
  error: string | null;
}> {
  try {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const timeoutPromise = new Promise<{ events: EventRow[]; error: string }>(
      (resolve) => {
        timeoutId = setTimeout(
          () =>
            resolve({
              events: [],
              error:
                "La agenda tardó demasiado en cargar. Reintenta en unos segundos.",
            }),
          FEED_QUERY_TIMEOUT_MS
        );
      }
    );

    const result = await Promise.race([
      queryDestacadosEvents(),
      timeoutPromise,
    ]);
    if (timeoutId) clearTimeout(timeoutId);
    return result;
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "No se pudieron cargar los eventos";
    return { events: [], error: message };
  }
}

const getCachedDestacadosFeed = unstable_cache(
  () => loadDestacadosEvents(),
  ["destacados-feed-events"],
  { revalidate: FEED_REVALIDATE_SECONDS, tags: ["feed", "destacados"] }
);

async function queryFeedEvents(dayCount: number, tight: boolean): Promise<{
  events: EventRow[];
  error: string | null;
}> {
  const { from, to } = tight
    ? getEventsQueryDateRangeTight(dayCount)
    : getEventsQueryDateRange(dayCount);
  const supabase = createClient();

  const { data, error } = await supabase
    .from("events")
    .select(FEED_EVENT_SELECT)
    .gte("date", from)
    .lte("date", to)
    .order("date", { ascending: true })
    .order("time", { ascending: true });

  if (error) {
    return { events: [], error: error.message };
  }

  return { events: normalizeFeedEvents(data as EventRow[]), error: null };
}

async function loadFeedEvents(
  dayCount: number,
  tight: boolean
): Promise<{
  events: EventRow[];
  error: string | null;
}> {
  try {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const timeoutPromise = new Promise<{ events: EventRow[]; error: string }>(
      (resolve) => {
        timeoutId = setTimeout(
          () =>
            resolve({
              events: [],
              error:
                "La agenda tardó demasiado en cargar. Reintenta en unos segundos.",
            }),
          FEED_QUERY_TIMEOUT_MS
        );
      }
    );

    const result = await Promise.race([
      queryFeedEvents(dayCount, tight),
      timeoutPromise,
    ]);
    if (timeoutId) clearTimeout(timeoutId);
    return result;
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "No se pudieron cargar los eventos";
    return { events: [], error: message };
  }
}

/** dayCount + tight forman parte de la clave de cache (evita colisión home/full). */
const getCachedFeed = unstable_cache(
  (dayCount: number, tight: boolean) => loadFeedEvents(dayCount, tight),
  ["feed-events"],
  { revalidate: FEED_REVALIDATE_SECONDS, tags: ["feed"] }
);

/** Feed completo (7 días) — hubs, sitemap, semana completa. */
export async function fetchFeedEvents() {
  return getCachedFeed(FEED_DAY_COUNT, false);
}

/** Feed ligero para la home (hoy + mañana). */
export async function fetchHomeFeedEvents() {
  return getCachedFeed(HOME_SSR_DAY_COUNT, true);
}

/** Semana + estrenos editoriales recientes para Destacados. */
export async function fetchDestacadosFeedEvents() {
  return getCachedDestacadosFeed();
}

/** Dedup en la misma petición (generateMetadata + Page). */
export const getHomeFeedEventsForPage = cache(fetchHomeFeedEvents);

export const getDestacadosFeedEventsForPage = cache(fetchDestacadosFeedEvents);

/** @deprecated Usar getDestacadosFeedEventsForPage */
export const getWeekFeedEventsForPage = getDestacadosFeedEventsForPage;
