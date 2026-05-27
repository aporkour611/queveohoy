import type { Metadata } from "next";
import { HomePage } from "./components/HomePage";
import { HomeJsonLd } from "./components/HomeJsonLd";
import { getHomeFeedEventsForPage, getDestacadosFeedEventsForPage } from "./lib/events-feed-server";
import {
  buildHomeMetadataDescription,
  buildHomeMetadataTitle,
} from "./lib/seo-jsonld";
import { trimHomeSsrEvents } from "./lib/featured";
import { pageMetadata, seoKeywords } from "./lib/seo";

export const revalidate = 900;

export async function generateMetadata(): Promise<Metadata> {
  const { events } = await getHomeFeedEventsForPage();
  return pageMetadata(
    "/",
    buildHomeMetadataTitle(),
    buildHomeMetadataDescription(events),
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
