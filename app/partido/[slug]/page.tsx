import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PartidoJsonLd } from "../../components/PartidoJsonLd";
import { PartidoPage } from "../../components/PartidoPage";
import { getFeedEventsForPage } from "../../lib/events-feed-server";
import { findEventBySlug } from "../../lib/event-slug";
import { eventLabel } from "../../lib/seo-events";
import { displayTime } from "../../lib/madrid-time";
import { pageMetadata } from "../../lib/seo";
import { resolveChannelsForEvent } from "../../lib/channels";

export const revalidate = 600;
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
  const time = event.time ? displayTime(event.time) : "";
  const channel = resolveChannelsForEvent(event)[0];
  const description = [label, time, channel, event.competition]
    .filter(Boolean)
    .join(" · ");

  return pageMetadata(
    `/partido/${slug}`,
    `${label} — horario y canal en TV`,
    `${description}. Consulta dónde verlo en queveohoy.es.`
  );
}

export default async function PartidoRoute({ params }: PageProps) {
  const { slug } = await params;
  const { events } = await getFeedEventsForPage();
  const event = findEventBySlug(events, slug);

  if (!event) notFound();

  return (
    <>
      <PartidoJsonLd event={event} />
      <PartidoPage event={event} />
    </>
  );
}
