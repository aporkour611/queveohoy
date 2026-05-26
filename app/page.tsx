import type { Metadata } from "next";
import { HomeJsonLd } from "./components/HomeJsonLd";
import { HomePageClient } from "./components/HomePageClient";
import { buildHomeMetadataTitle } from "./lib/seo-jsonld";
import { defaultDescription, defaultOpenGraph, siteUrl } from "./lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const title = buildHomeMetadataTitle();

  return {
    title,
    description: defaultDescription,
    alternates: { canonical: siteUrl },
    openGraph: {
      ...defaultOpenGraph,
      title,
      description: defaultDescription,
      url: siteUrl,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: defaultDescription,
      images: ["/logo-queveohoy.png"],
    },
  };
}

export default function Page() {
  return (
    <>
      <HomeJsonLd events={[]} />
      <HomePageClient />
    </>
  );
}
