import type { Metadata } from "next";

function resolveSiteUrl(): string {
  const fallback = "https://queveohoy.es";
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return fallback;
  try {
    const normalized = raw.includes("://") ? raw : `https://${raw}`;
    return new URL(normalized).origin;
  } catch {
    return fallback;
  }
}

export const siteUrl = resolveSiteUrl();

export const siteName = "Qué veo hoy";
export const siteBrand = "queveohoy.es";

export const defaultDescription =
  "Qué ver hoy en la tele y streaming: partidos de fútbol, Champions, LaLiga, F1, MotoGP, UFC, baloncesto, tenis, series y estrenos con horarios y canales en España.";

export const homeTitle =
  "Qué ver hoy en TV y streaming — partidos, deportes y series";

export const seoKeywords = [
  "que veo hoy",
  "qué ver hoy",
  "que ver hoy",
  "qué ver hoy en la tele",
  "que ver hoy en tv",
  "partidos hoy",
  "partidos hoy en la tele",
  "partidos hoy tv",
  "fútbol hoy tv",
  "futbol hoy tv",
  "champions hoy",
  "champions league hoy",
  "laliga hoy",
  "laliga hoy tv",
  "agenda tv hoy",
  "horarios partidos hoy",
  "formula 1 hoy",
  "f1 hoy tv",
  "ufc hoy",
  "motogp hoy",
  "nba hoy tv",
  "tenis hoy tv",
  "copa del rey hoy",
  "series hoy tv",
  "queveohoy",
];

export const defaultOpenGraph = {
  type: "website" as const,
  locale: "es_ES",
  siteName,
  images: [
    {
      url: "/icons/app-icon-512.png",
      width: 512,
      height: 512,
      alt: "Qué veo hoy — queveohoy.es",
    },
  ],
};

export const rootMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${homeTitle} | ${siteBrand}`,
    template: `%s | ${siteBrand}`,
  },
  description: defaultDescription,
  keywords: seoKeywords,
  applicationName: siteName,
  authors: [{ name: siteBrand, url: siteUrl }],
  creator: siteBrand,
  publisher: siteBrand,
  category: "sports",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: siteUrl,
    languages: {
      "es-ES": siteUrl,
    },
  },
  openGraph: {
    ...defaultOpenGraph,
    title: homeTitle,
    description: defaultDescription,
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: homeTitle,
    description: defaultDescription,
    images: ["/icons/app-icon-512.png"],
  },
  icons: {
    icon: [
      { url: "/logo-queveohoy.svg", type: "image/svg+xml" },
      { url: "/icons/app-icon.svg", type: "image/svg+xml" },
      { url: "/icons/app-icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/icons/app-icon-192.png",
  },
};

export function pageMetadata(
  path: string,
  title: string,
  description: string,
  keywords?: string[]
): Metadata {
  const url = path === "/" ? siteUrl : `${siteUrl}${path}`;
  return {
    title,
    description,
    ...(keywords?.length ? { keywords } : {}),
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "es_ES",
      siteName,
      title,
      description,
      url,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export const homeMetadata: Metadata = {
  title: homeTitle,
  description: defaultDescription,
  alternates: { canonical: siteUrl },
  openGraph: {
    ...defaultOpenGraph,
    title: homeTitle,
    description: defaultDescription,
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: homeTitle,
    description: defaultDescription,
    images: ["/icons/app-icon-512.png"],
  },
};
