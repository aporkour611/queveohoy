import { FEED_REVALIDATE_SECONDS } from "../lib/cache-config";
import { fetchFeedEvents } from "../lib/events-feed-server";
import { buildRssXml } from "../lib/rss-feed";

export const revalidate = 600;

export async function GET() {
  const { events } = await fetchFeedEvents();
  const xml = buildRssXml(events);

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": `public, s-maxage=${FEED_REVALIDATE_SECONDS}, stale-while-revalidate=${FEED_REVALIDATE_SECONDS * 2}`,
    },
  });
}
