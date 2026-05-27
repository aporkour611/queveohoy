import type { MetadataRoute } from "next";
import {
  getMadridTodayKey,
  getRollingSeoDateKeys,
  isPastSeoDate,
  partidosHoyDatePath,
} from "./seo-date";
import { partidoSlugsForSitemap } from "./event-slug";
import { SEO_GUIDES } from "./seo-guides";
import { SEO_HUBS } from "./seo-hubs";
import { siteUrl } from "./seo";
import type { EventRow } from "../components/types";

/** URLs que no dependen de Supabase (siempre válidas para Google). */
export function buildStaticSitemapEntries(now = new Date()): MetadataRoute.Sitemap {
  const todayKey = getMadridTodayKey();

  const hubEntries = SEO_HUBS.map((hub) => ({
    url: `${siteUrl}/${hub.slug}`,
    lastModified: now,
    changeFrequency: "hourly" as const,
    priority: hub.priority,
  }));

  const dateEntries = getRollingSeoDateKeys().map((dateKey) => ({
    url: `${siteUrl}${partidosHoyDatePath(dateKey)}`,
    lastModified: now,
    changeFrequency: "hourly" as const,
    priority: dateKey === todayKey ? 0.98 : 0.88,
  }));

  const guideEntries = SEO_GUIDES.map((guide) => ({
    url: `${siteUrl}/guia/${guide.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: guide.priority,
  }));

  return [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 1,
    },
    ...hubEntries,
    ...dateEntries,
    ...guideEntries,
    {
      url: `${siteUrl}/privacidad`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/cookies`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}

export function buildPartidoSitemapEntries(
  events: EventRow[],
  now = new Date()
): MetadataRoute.Sitemap {
  const futureEvents = events.filter(
    (event) => event.date && !isPastSeoDate(event.date)
  );

  return partidoSlugsForSitemap(futureEvents).map((slug) => ({
    url: `${siteUrl}/partido/${slug}`,
    lastModified: now,
    changeFrequency: "hourly" as const,
    priority: 0.7,
  }));
}
