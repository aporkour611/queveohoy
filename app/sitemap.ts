import type { MetadataRoute } from "next";
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

  return [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 1,
    },
    ...hubEntries,
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
