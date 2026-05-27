import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { HomeTrafficHubs } from "./components/HomeTrafficHubs";
import { HomePage } from "./components/HomePage";
import { ShareTodayBar } from "./components/ShareTodayBar";
import { HomeJsonLd } from "./components/HomeJsonLd";
import { fetchHomeFeedEvents } from "./lib/events-feed-server";
import {
  buildHomeMetadataDescription,
  buildHomeMetadataTitle,
} from "./lib/seo-jsonld";
import { pageMetadata, seoKeywords } from "./lib/seo";

const HomeEventOutline = dynamic(
  () =>
    import("./components/HomeEventOutline").then((mod) => mod.HomeEventOutline),
  { loading: () => null }
);

const HomeFaq = dynamic(
  () => import("./components/HomeFaq").then((mod) => mod.HomeFaq),
  { loading: () => null }
);

export const revalidate = 900;

export async function generateMetadata(): Promise<Metadata> {
  const { events } = await fetchHomeFeedEvents();
  return pageMetadata(
    "/",
    buildHomeMetadataTitle(),
    buildHomeMetadataDescription(events),
    seoKeywords
  );
}

export default async function Page() {
  const { events, error } = await fetchHomeFeedEvents();

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
