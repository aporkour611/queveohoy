import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { LiveWatchPage } from "../../components/LiveWatchPage";
import { getFeedEventsForPage } from "../../lib/events-feed-server";
import { findEventBySlug } from "../../lib/event-slug";
import { getFreeLiveBroadcast, isEventLiveNow } from "../../lib/event-live";
import { resolveLivePlayerEmbed } from "../../lib/live-player";
import { eventLabel } from "../../lib/seo-events";
import { pageMetadata, siteUrl } from "../../lib/seo";

export const revalidate = 60;
export const dynamicParams = true;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { events } = await getFeedEventsForPage();
  const event = findEventBySlug(events, slug);
  if (!event) return {};

  const label = eventLabel(event);
  const live = getFreeLiveBroadcast(event);

  return pageMetadata(
    `/vivo/${slug}`,
    `${label} en directo`,
    live
      ? `Retransmisión en directo en ${live.channel}. Ver ahora en queveohoy.es.`
      : `Consulta la retransmisión de ${label} en queveohoy.es.`
  );
}

export default async function LiveWatchRoute({ params }: PageProps) {
  const { slug } = await params;
  const { events } = await getFeedEventsForPage();
  const event = findEventBySlug(events, slug);

  if (!event) notFound();

  const live = getFreeLiveBroadcast(event);
  if (!live) {
    redirect(`/partido/${slug}`);
  }

  const player = resolveLivePlayerEmbed(live.channel, siteUrl);

  return <LiveWatchPage event={event} player={player} />;
}
