import type { Metadata } from "next";

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://queveohoy.es";

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
  "series hoy tv",
  "queveohoy",
];

export const defaultOpenGraph = {
  type: "website" as const,
  locale: "es_ES",
  siteName,
  images: [
    {
      url: "/logo-queveohoy.png",
      width: 1200,
      height: 630,
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
    images: ["/logo-queveohoy.png"],
  },
  icons: {
    icon: "/logo-queveohoy.png",
    apple: "/logo-queveohoy.png",
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
      ...defaultOpenGraph,
      title,
      description,
      url,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/logo-queveohoy.png"],
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
    images: ["/logo-queveohoy.png"],
  },
};
