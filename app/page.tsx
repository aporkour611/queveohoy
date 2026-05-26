import type { Metadata } from "next";
import { HomeEventOutline } from "./components/HomeEventOutline";
import { HomeJsonLd } from "./components/HomeJsonLd";
import { HomePage } from "./components/HomePage";
import { fetchFeedEvents } from "./lib/events-feed-server";
import {
  buildHomeMetadataDescription,
  buildHomeMetadataTitle,
  buildHomePageLead,
} from "./lib/seo-jsonld";
import { defaultOpenGraph, siteUrl } from "./lib/seo";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const { events } = await fetchFeedEvents();
  const title = buildHomeMetadataTitle();
  const description = buildHomeMetadataDescription(events);

  return {
    title,
    description,
    alternates: { canonical: siteUrl },
    openGraph: {
      ...defaultOpenGraph,
      title,
      description,
      url: siteUrl,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/logo-queveohoy.png"],
    },
  };
}

export default async function Page() {
  const { events, error } = await fetchFeedEvents();
  const pageTitle = buildHomeMetadataTitle();
  const pageLead = buildHomePageLead(events);

  return (
    <>
      <HomeJsonLd events={events} />
      <HomePage
        initialEvents={events}
        initialError={error}
        pageTitle={pageTitle}
        pageLead={pageLead}
      >
        <HomeEventOutline events={events} />
      </HomePage>
    </>
  );
}
