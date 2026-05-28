import { FEED_REVALIDATE_SECONDS } from "../lib/cache-config";
import { fetchFeedEvents } from "../lib/events-feed-server";
import { buildRssXml } from "../lib/rss-feed";

export const revalidate = 600;

export async function GET() {
  try {
    const { events } = await fetchFeedEvents();
    const xml = buildRssXml(events);

    return new Response(xml, {
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": `public, s-maxage=${FEED_REVALIDATE_SECONDS}, stale-while-revalidate=${FEED_REVALIDATE_SECONDS * 2}`,
      },
    });
  } catch {
    const xml = buildRssXml([]);
    return new Response(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=60",
      },
    });
  }
}
