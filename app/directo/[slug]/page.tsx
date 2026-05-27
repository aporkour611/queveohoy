import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChannelWatchPage } from "../../components/ChannelWatchPage";
import { resolveChannelsForEvent } from "../../lib/channels";
import {
  channelSlug,
  collectFeedChannelNames,
  findChannelBySlug,
} from "../../lib/channel-slug";
import { getFeedEventsForPage } from "../../lib/events-feed-server";
import { resolveLivePlayerEmbed } from "../../lib/live-player";
import { pageMetadata, siteUrl } from "../../lib/seo";

export const revalidate = 60;
export const dynamicParams = true;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const { events } = await getFeedEventsForPage();
  const names = collectFeedChannelNames(events, resolveChannelsForEvent);
  const slugs = new Set(names.map((name) => channelSlug(name)));

  return [...slugs].slice(0, 40).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { events } = await getFeedEventsForPage();
  const names = collectFeedChannelNames(events, resolveChannelsForEvent);
  const channel = findChannelBySlug(slug, names);
  if (!channel) return {};

  return pageMetadata(
    `/directo/${slug}`,
    `Ver ${channel}`,
    `Retransmisión de ${channel} en queveohoy.es.`
  );
}

export default async function DirectoRoute({ params }: PageProps) {
  const { slug } = await params;
  const { events } = await getFeedEventsForPage();
  const names = collectFeedChannelNames(events, resolveChannelsForEvent);
  const channel = findChannelBySlug(slug, names);

  if (!channel) notFound();

  const player = resolveLivePlayerEmbed(channel, siteUrl);

  return <ChannelWatchPage channel={channel} player={player} />;
}
