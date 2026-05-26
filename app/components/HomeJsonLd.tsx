import {
  defaultDescription,
  siteBrand,
  siteName,
  siteUrl,
} from "../lib/seo";

/** JSON-LD estatico para la home (sin dependencias de datos). */
export function HomeJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: siteBrand,
        url: siteUrl,
        logo: `${siteUrl}/logo-queveohoy.png`,
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        name: siteName,
        alternateName: ["que veo hoy", "qué ver hoy", "queveohoy"],
        url: siteUrl,
        description: defaultDescription,
        inLanguage: "es-ES",
        publisher: { "@id": `${siteUrl}/#organization` },
      },
      {
        "@type": "WebPage",
        "@id": `${siteUrl}/#webpage`,
        url: siteUrl,
        name: "Qué ver hoy en TV y streaming",
        description: defaultDescription,
        isPartOf: { "@id": `${siteUrl}/#website` },
        inLanguage: "es-ES",
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
