import type { MetadataRoute } from "next";
import type { EventRow } from "./components/types";
import { fetchFeedEvents } from "./lib/events-feed-server";
import { raceWithTimeout } from "./lib/race-with-timeout";
import {
  buildPartidoSitemapEntries,
  buildStaticSitemapEntries,
} from "./lib/sitemap-entries";

export const revalidate = 900;

const SITEMAP_DB_TIMEOUT_MS = 5_000;

async function fetchSitemapEvents(): Promise<EventRow[]> {
  const result = await raceWithTimeout(
    fetchFeedEvents(),
    SITEMAP_DB_TIMEOUT_MS,
    () => ({ events: [] as EventRow[], error: null })
  );
  return result.events;
}

/** Sitemap: URLs estáticas siempre; partidos solo si Supabase responde a tiempo. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticEntries = buildStaticSitemapEntries(now);

  try {
    const events = await fetchSitemapEvents();
    if (events.length === 0) return staticEntries;
    return [...staticEntries, ...buildPartidoSitemapEntries(events, now)];
  } catch {
    return staticEntries;
  }
}
