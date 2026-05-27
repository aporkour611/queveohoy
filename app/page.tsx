import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { HomePage } from "./components/HomePage";
import { ShareTodayBar } from "./components/ShareTodayBar";
import { HomeJsonLd } from "./components/HomeJsonLd";
import { HomeFaq } from "./components/HomeFaq";
import { HomeEventOutline } from "./components/HomeEventOutline";
import { getHomeFeedEventsForPage } from "./lib/events-feed-server";
import {
  buildHomeMetadataDescription,
  buildHomeMetadataTitle,
} from "./lib/seo-jsonld";
import { pageMetadata, seoKeywords } from "./lib/seo";

const HomeTrafficHubs = dynamic(
  () =>
    import("./components/HomeTrafficHubs").then((mod) => mod.HomeTrafficHubs),
  { loading: () => null }
);

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
  const { events, error } = await getHomeFeedEventsForPage();

  return (
    <>
      <HomeJsonLd events={events} />
      <HomePage initialEvents={events} initialError={error}>
        <HomeTrafficHubs events={events} />
        <ShareTodayBar />
        <HomeFaq />
        <HomeEventOutline events={events} />
      </HomePage>
    </>
  );
}
