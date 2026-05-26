import type { Metadata } from "next";
import { HomeJsonLd } from "./components/HomeJsonLd";
import { HomePage } from "./components/HomePage";
import { fetchFeedEvents } from "./lib/events-feed-server";
import { homeMetadata } from "./lib/seo";

export const metadata: Metadata = homeMetadata;

export const revalidate = 300;

export default async function Page() {
  const { events, error } = await fetchFeedEvents();

  return (
    <>
      <HomeJsonLd />
      <HomePage initialEvents={events} initialError={error} />
    </>
  );
}
