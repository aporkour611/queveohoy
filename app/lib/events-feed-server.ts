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
import { findEventBySlug, parsePartidoSlug } from "./event-slug";
import { isSupabaseConfigured } from "./supabase-config";
import { getMadridTodayKey } from "./seo-date";
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

function isUncacheableFeedResult(result: {
  events: EventRow[];
  error: string | null;
}): boolean {
  return Boolean(result.error) && result.events.length === 0;
}

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
  async (_calendarDay: string) => {
    const result = await loadDestacadosEvents();
    if (isUncacheableFeedResult(result)) {
      throw new Error(result.error ?? "destacados-feed-empty");
    }
    return result;
  },
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
  async (dayCount: number, tight: boolean, _calendarDay: string) => {
    const result = await loadFeedEvents(dayCount, tight);
    if (isUncacheableFeedResult(result)) {
      throw new Error(result.error ?? "feed-empty");
    }
    return result;
  },
  ["feed-events"],
  { revalidate: FEED_REVALIDATE_SECONDS, tags: ["feed"] }
);

async function readCachedFeed<T>(
  loader: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    return await loader();
  } catch {
    return fallback;
  }
}

/** Feed completo (7 días) — hubs, sitemap, RSS. */
export async function fetchFeedEvents() {
  const calendarDay = getMadridTodayKey();
  return readCachedFeed(
    () => getCachedFeed(FEED_DAY_COUNT, false, calendarDay),
    FEED_TIMEOUT_FALLBACK
  );
}

/** Feed semanal ajustado (7 días exactos) — vista «Semana completa» en home. */
export async function fetchWeekViewFeedEvents() {
  const calendarDay = getMadridTodayKey();
  return readCachedFeed(
    () => getCachedFeed(FEED_DAY_COUNT, true, calendarDay),
    FEED_TIMEOUT_FALLBACK
  );
}

/** Feed ligero para la home (hoy + mañana). */
export async function fetchHomeFeedEvents() {
  const calendarDay = getMadridTodayKey();
  return readCachedFeed(
    () => getCachedFeed(HOME_SSR_DAY_COUNT, true, calendarDay),
    FEED_TIMEOUT_FALLBACK
  );
}

/** Semana + estrenos editoriales recientes para Destacados. */
export async function fetchDestacadosFeedEvents() {
  const calendarDay = getMadridTodayKey();
  return readCachedFeed(
    () => getCachedDestacadosFeed(calendarDay),
    FEED_TIMEOUT_FALLBACK
  );
}

/** Dedup en la misma petición (generateMetadata + Page). */
export const getHomeFeedEventsForPage = cache(fetchHomeFeedEvents);

export const getDestacadosFeedEventsForPage = cache(fetchDestacadosFeedEvents);

export const getFeedEventsForPage = cache(fetchFeedEvents);

const getCachedEventsForDate = unstable_cache(
  async (dateKey: string) => {
    if (!isSupabaseConfigured()) {
      return supabaseMissingFallback();
    }
    try {
      const supabase = createClient();
      const { data, error } = await withFeedQuerySignal(
        supabase
          .from("events")
          .select(FEED_EVENT_SELECT)
          .eq("date", dateKey)
          .order("time", { ascending: true })
          .limit(FEED_QUERY_ROW_LIMIT)
      );
      if (error) {
        return { events: [] as EventRow[], error: error.message };
      }
      return {
        events: normalizeFeedEvents((data ?? []) as EventRow[]),
        error: null,
      };
    } catch (err) {
      return {
        events: [] as EventRow[],
        error: err instanceof Error ? err.message : String(err),
      };
    }
  },
  ["feed-date"],
  { revalidate: FEED_REVALIDATE_SECONDS, tags: ["feed"] }
);

/** Eventos de un solo día (API pública, partido por slug). */
export async function fetchEventsForDate(dateKey: string) {
  return readCachedFeed(
    () => getCachedEventsForDate(dateKey),
    FEED_TIMEOUT_FALLBACK
  );
}

const getCachedEventById = unstable_cache(
  async (id: number) => fetchEventByIdUncached(id),
  ["event-by-id"],
  { revalidate: FEED_REVALIDATE_SECONDS, tags: ["feed"] }
);

async function fetchEventByIdUncached(
  id: number
): Promise<{ event: EventRow | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    const fallback = supabaseMissingFallback();
    return { event: null, error: fallback.error };
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("events")
      .select(FEED_EVENT_SELECT)
      .eq("id", id)
      .maybeSingle();

    if (error) {
      return { event: null, error: error.message };
    }

    if (!data) {
      return { event: null, error: null };
    }

    const [normalized] = normalizeFeedEvents([data as EventRow]);
    return { event: normalized ?? null, error: null };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "No se pudo cargar el evento";
    return { event: null, error: message };
  }
}

/** Evento por ID — query directa (API pública v1). */
export async function fetchEventById(
  id: number
): Promise<{ event: EventRow | null; error: string | null }> {
  return getCachedEventById(id);
}

/** Partido por slug sin cargar la semana entera. */
export async function fetchEventBySlug(
  slug: string
): Promise<{ event: EventRow | null; error: string | null }> {
  const parsed = parsePartidoSlug(slug);
  if (!parsed) {
    return { event: null, error: null };
  }

  const { events, error } = await fetchEventsForDate(parsed.date);
  if (error) {
    return { event: null, error };
  }

  return { event: findEventBySlug(events, slug) ?? null, error: null };
}

export const getEventBySlugForPage = cache(fetchEventBySlug);

/** Búsqueda en BD (título/equipos) en ventana semanal. */
export async function searchEventsByAgendaQuery(
  query: string,
  dateKey?: string
): Promise<{ events: EventRow[]; error: string | null }> {
  if (!isSupabaseConfigured()) {
    const fallback = supabaseMissingFallback();
    return { events: [], error: fallback.error };
  }

  const trimmed = query.trim();
  if (trimmed.length < 2) {
    return { events: [], error: null };
  }

  const pattern = `%${trimmed.replace(/[%_\\]/g, "")}%`;

  try {
    const supabase = createClient();
    const { from, to } = getEventsQueryDateRangeTight(FEED_DAY_COUNT);

    let builder = supabase
      .from("events")
      .select(FEED_EVENT_SELECT)
      .or(
        `title.ilike.${pattern},home_team.ilike.${pattern},away_team.ilike.${pattern},competition.ilike.${pattern}`
      );

    if (dateKey) {
      builder = builder.eq("date", dateKey);
    } else {
      builder = builder.gte("date", from).lte("date", to);
    }

    const { data, error } = await withFeedQuerySignal(
      builder
        .order("date", { ascending: true })
        .order("time", { ascending: true })
        .limit(FEED_QUERY_ROW_LIMIT)
    );
    if (error) {
      return { events: [], error: error.message };
    }

    return {
      events: normalizeFeedEvents((data ?? []) as EventRow[]),
      error: null,
    };
  } catch (err) {
    return {
      events: [],
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
