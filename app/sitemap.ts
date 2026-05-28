import type { MetadataRoute } from "next";
import type { EventRow } from "./components/types";
import { fetchFeedEvents } from "./lib/events-feed-server";
import {
  buildPartidoSitemapEntries,
  buildStaticSitemapEntries,
} from "./lib/sitemap-entries";

export const revalidate = 900;

const SITEMAP_DB_TIMEOUT_MS = 5_000;

async function fetchSitemapEvents(): Promise<EventRow[]> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  try {
    const result = await Promise.race([
      fetchFeedEvents(),
      new Promise<{ events: EventRow[] }>((resolve) => {
        timeoutId = setTimeout(() => resolve({ events: [] }), SITEMAP_DB_TIMEOUT_MS);
      }),
    ]);
    return result.events;
  } catch {
    return [];
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

/** Sitemap: URLs estáticas siempre; partidos solo si Supabase responde a tiempo. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticEntries = buildStaticSitemapEntries(now);
  const events = await fetchSitemapEvents();
  if (events.length === 0) return staticEntries;
  return [...staticEntries, ...buildPartidoSitemapEntries(events, now)];
}
