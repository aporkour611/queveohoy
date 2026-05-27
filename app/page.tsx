import type { Metadata } from "next";
import { HomePage } from "./components/HomePage";
import { HomeJsonLd } from "./components/HomeJsonLd";
import { getHomeFeedEventsForPage, getDestacadosFeedEventsForPage } from "./lib/events-feed-server";
import { buildHomeMetadataTitle } from "./lib/seo-jsonld";
import { trimHomeSsrEvents } from "./lib/featured";
import { defaultDescription, pageMetadata, seoKeywords } from "./lib/seo";

export const revalidate = 900;

export function generateMetadata(): Metadata {
  return pageMetadata(
    "/",
    buildHomeMetadataTitle(),
    defaultDescription,
    seoKeywords
  );
}

export default async function Page() {
  const [{ events, error }, { events: weekEvents }] = await Promise.all([
    getHomeFeedEventsForPage(),
    getDestacadosFeedEventsForPage(),
  ]);
  const ssrEvents = trimHomeSsrEvents(events);

  return (
    <>
      <HomeJsonLd events={ssrEvents} />
      <HomePage
        initialEvents={ssrEvents}
        initialDestacadosEvents={weekEvents}
        initialError={error}
      />
    </>
  );
}
