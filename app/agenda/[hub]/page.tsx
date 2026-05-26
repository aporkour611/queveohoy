import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SeoHubPage } from "../../components/SeoHubPage";
import { fetchFeedEvents } from "../../lib/events-feed-server";
import {
  buildHubMetadataDescription,
  buildHubMetadataTitle,
  getSeoHub,
} from "../../lib/seo-hubs";
import { pageMetadata } from "../../lib/seo";

export const revalidate = 600;
export const dynamicParams = true;

type PageProps = {
  params: Promise<{ hub: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { hub: slug } = await params;
  const hub = getSeoHub(slug);
  if (!hub) return {};

  const { events } = await fetchFeedEvents();
  const title = buildHubMetadataTitle(hub);
  const description = buildHubMetadataDescription(hub, events);

  return pageMetadata(`/${hub.slug}`, title, description, hub.keywords);
}

export default async function HubRoute({ params }: PageProps) {
  const { hub: slug } = await params;
  const hub = getSeoHub(slug);
  if (!hub) notFound();

  const { events } = await fetchFeedEvents();

  return <SeoHubPage hub={hub} events={events} />;
}
