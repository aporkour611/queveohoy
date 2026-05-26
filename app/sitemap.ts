import type { MetadataRoute } from "next";
import {
  getMadridTodayKey,
  getRollingSeoDateKeys,
  partidosHoyDatePath,
} from "./lib/seo-date";
import { SEO_GUIDES } from "./lib/seo-guides";
import { SEO_HUBS } from "./lib/seo-hubs";
import { siteUrl } from "./lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const hubEntries = SEO_HUBS.map((hub) => ({
    url: `${siteUrl}/${hub.slug}`,
    lastModified: now,
    changeFrequency: "hourly" as const,
    priority: hub.priority,
  }));

  const todayKey = getMadridTodayKey();
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
