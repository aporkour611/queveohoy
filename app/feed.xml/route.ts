import { fetchFeedEvents } from "../lib/events-feed-server";
import { buildRssXml } from "../lib/rss-feed";

export const revalidate = 300;

export async function GET() {
  const { events } = await fetchFeedEvents();
  const xml = buildRssXml(events);

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
