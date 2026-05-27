import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SeoHubPage } from "../../components/SeoHubPage";
import { getFeedEventsForPage } from "../../lib/events-feed-server";
import { buildHubMetadataTitle, getSeoHub } from "../../lib/seo-hubs";
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

  return pageMetadata(
    `/${hub.slug}`,
    buildHubMetadataTitle(hub),
    hub.description,
    hub.keywords
  );
}

export default async function HubRoute({ params }: PageProps) {
  const { hub: slug } = await params;
  const hub = getSeoHub(slug);
  if (!hub) notFound();

  const { events } = await getFeedEventsForPage();

  return <SeoHubPage hub={hub} events={events} />;
}
