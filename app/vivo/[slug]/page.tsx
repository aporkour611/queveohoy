import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { channelWatchPath } from "../../lib/channel-slug";
import { getFeedEventsForPage } from "../../lib/events-feed-server";
import { findEventBySlug } from "../../lib/event-slug";
import { getFreeLiveBroadcast } from "../../lib/event-live";

export const revalidate = 60;
export const dynamicParams = true;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return {};
}

/** Compatibilidad: /vivo/[evento] → /directo/[canal] o ficha del partido. */
export default async function VivoLegacyRedirect({ params }: PageProps) {
  const { slug } = await params;
  const { events } = await getFeedEventsForPage();
  const event = findEventBySlug(events, slug);

  if (!event) notFound();

  const live = getFreeLiveBroadcast(event);
  if (live) {
    redirect(channelWatchPath(live.channel));
  }

  redirect(`/partido/${slug}`);
}
