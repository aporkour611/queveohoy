import type { EventRow } from "../components/types";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import {
  FEED_QUERY_ROW_LIMIT,
  FEED_QUERY_TIMEOUT_MS,
  FEED_REVALIDATE_SECONDS,
} from "./cache-config";
import { FEED_DAY_COUNT, FEED_EVENT_SELECT, normalizeFeedEvents } from "./events-feed";
import { HOME_SSR_DAY_COUNT } from "./home-feed-config";
import { CURATED_MOVIES } from "./movies-curated";
import { isSupabaseConfigured } from "./supabase-config";
import { createClient } from "./supabase/server";
import {
  getEventsQueryDateRange,
  getEventsQueryDateRangeTight,
} from "./timezone";
import { raceWithTimeout } from "./race-with-timeout";

const CURATED_DESTACADOS_EXTERNAL_IDS = CURATED_MOVIES.map(
  (movie) => `tmdb_movie_${movie.tmdbId}`
);

/** Ventana semanal + estrenos editoriales (sin 21 días de histórico completo). */
function getDestacadosQueryDateRange(): { from: string; to: string } {
  return getEventsQueryDateRange(FEED_DAY_COUNT);
}

function feedQuerySignal(): AbortSignal | undefined {
  if (typeof AbortSignal.timeout === "function") {
    return AbortSignal.timeout(FEED_QUERY_TIMEOUT_MS);
  }
  return undefined;
}

function withFeedQuerySignal<T extends { abortSignal: (signal: AbortSignal) => T }>(
  query: T
): T {
  const signal = feedQuerySignal();
  return signal ? query.abortSignal(signal) : query;
}

function supabaseMissingFallback(): { events: EventRow[]; error: string | null } {
  if (process.env.NODE_ENV !== "production") {
    return { events: [], error: null };
  }
  return {
    events: [],
    error:
      "La agenda no está conectada a la base de datos. Revisa SUPABASE_URL y SUPABASE_ANON_KEY en Vercel (Production).",
  };
}

async function queryDestacadosEvents(): Promise<{
  events: EventRow[];
  error: string | null;
}> {
  if (!isSupabaseConfigured()) {
    return supabaseMissingFallback();
  }

  try {
    const { from, to } = getDestacadosQueryDateRange();
    const supabase = createClient();

    const [rangeResult, curatedResult] = await Promise.all([
      withFeedQuerySignal(
        supabase
          .from("events")
          .select(FEED_EVENT_SELECT)
          .gte("date", from)
          .lte("date", to)
          .order("date", { ascending: true })
          .order("time", { ascending: true })
          .limit(FEED_QUERY_ROW_LIMIT)
      ),
      withFeedQuerySignal(
        supabase
          .from("events")
          .select(FEED_EVENT_SELECT)
          .in("external_id", CURATED_DESTACADOS_EXTERNAL_IDS)
      ),
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
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "No se pudieron cargar los eventos";
    return { events: [], error: message };
  }
}

const FEED_TIMEOUT_FALLBACK = {
  events: [] as EventRow[],
  error: "La agenda tardó demasiado en cargar. Reintenta en unos segundos.",
};

async function loadDestacadosEvents(): Promise<{
  events: EventRow[];
  error: string | null;
}> {
  return raceWithTimeout(
    queryDestacadosEvents(),
    FEED_QUERY_TIMEOUT_MS,
    () => FEED_TIMEOUT_FALLBACK
  );
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
  if (!isSupabaseConfigured()) {
    return supabaseMissingFallback();
  }

  try {
    const { from, to } = tight
      ? getEventsQueryDateRangeTight(dayCount)
      : getEventsQueryDateRange(dayCount);
    const supabase = createClient();

    const { data, error } = await withFeedQuerySignal(
      supabase
        .from("events")
        .select(FEED_EVENT_SELECT)
        .gte("date", from)
        .lte("date", to)
        .order("date", { ascending: true })
        .order("time", { ascending: true })
        .limit(FEED_QUERY_ROW_LIMIT)
    );

    if (error) {
      return { events: [], error: error.message };
    }

    return { events: normalizeFeedEvents(data as EventRow[]), error: null };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "No se pudieron cargar los eventos";
    return { events: [], error: message };
  }
}

async function loadFeedEvents(
  dayCount: number,
  tight: boolean
): Promise<{
  events: EventRow[];
  error: string | null;
}> {
  return raceWithTimeout(
    queryFeedEvents(dayCount, tight),
    FEED_QUERY_TIMEOUT_MS,
    () => FEED_TIMEOUT_FALLBACK
  );
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

export const getFeedEventsForPage = cache(fetchFeedEvents);
