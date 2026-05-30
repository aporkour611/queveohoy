import type { SeoGuideConfig } from "./seo-guides"
import { siteBrand, siteName, siteUrl } from "./seo"

export function buildGuideJsonLd(guide: SeoGuideConfig) {
  const pageUrl = `${siteUrl}/guia/${guide.slug}`

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: siteBrand,
        url: siteUrl,
        logo: `${siteUrl}/logo-queveohoy.svg`,
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        name: siteName,
        url: siteUrl,
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}/#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Inicio",
            item: siteUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Guías",
            item: `${siteUrl}/guia`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: guide.title,
            item: pageUrl,
          },
        ],
      },
      {
        "@type": "Article",
        "@id": `${pageUrl}/#article`,
        headline: guide.h1,
        description: guide.description,
        url: pageUrl,
        inLanguage: "es-ES",
        isPartOf: { "@id": `${siteUrl}/#website` },
        author: {
          "@type": "Organization",
          name: siteBrand,
        },
        publisher: {
          "@type": "Organization",
          name: siteBrand,
          logo: {
            "@type": "ImageObject",
            url: `${siteUrl}/logo-queveohoy.svg`,
          },
        },
      },
    ],
  }
}
