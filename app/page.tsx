import type { Metadata } from "next";
import { HomeEventOutline } from "./components/HomeEventOutline";
import { HomeFaq } from "./components/HomeFaq";
import { HomeTrafficHubs } from "./components/HomeTrafficHubs";
import { HomePage } from "./components/HomePage";
import { ShareTodayBar } from "./components/ShareTodayBar";
import { HomeJsonLd } from "./components/HomeJsonLd";
import { fetchFeedEvents } from "./lib/events-feed-server";
import {
  buildHomeMetadataDescription,
  buildHomeMetadataTitle,
} from "./lib/seo-jsonld";
import { pageMetadata, seoKeywords } from "./lib/seo";

export const revalidate = 600;

export async function generateMetadata(): Promise<Metadata> {
  const { events } = await fetchFeedEvents();
  return pageMetadata(
    "/",
    buildHomeMetadataTitle(),
    buildHomeMetadataDescription(events),
    seoKeywords
  );
}

export default async function Page() {
  const { events, error } = await fetchFeedEvents();

  return (
    <>
      <HomeJsonLd events={events} />
      <HomePage
        initialEvents={events}
        initialError={error}
        initialFetchedAt={new Date().toISOString()}
      >
        <HomeTrafficHubs events={events} />
        <ShareTodayBar />
        <HomeFaq />
        <HomeEventOutline events={events} />
      </HomePage>
    </>
  );
}
