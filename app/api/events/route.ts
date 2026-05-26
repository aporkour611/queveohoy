import { NextResponse } from "next/server";
import { FEED_REVALIDATE_SECONDS } from "@/app/lib/cache-config";
import { fetchFeedEvents } from "@/app/lib/events-feed-server";

export const revalidate = 600;

export async function GET() {
  const { events, error } = await fetchFeedEvents();

  if (error) {
    return NextResponse.json({ error, events: [] }, { status: 502 });
  }

  return NextResponse.json(
    { events },
    {
      headers: {
        "Cache-Control": `public, s-maxage=${FEED_REVALIDATE_SECONDS}, stale-while-revalidate=${FEED_REVALIDATE_SECONDS * 2}`,
      },
    }
  );
}
