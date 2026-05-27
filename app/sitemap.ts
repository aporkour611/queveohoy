import type { MetadataRoute } from "next";
import { fetchFeedEvents } from "./lib/events-feed-server";
import {
  buildPartidoSitemapEntries,
  buildStaticSitemapEntries,
} from "./lib/sitemap-entries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticEntries = buildStaticSitemapEntries(now);

  try {
    const { events } = await fetchFeedEvents();
    return [...staticEntries, ...buildPartidoSitemapEntries(events, now)];
  } catch (err) {
    console.error("sitemap: feed no disponible, solo URLs estáticas", err);
    return staticEntries;
  }
}
