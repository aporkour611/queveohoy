import { NextResponse } from "next/server";
import { FEED_REVALIDATE_SECONDS } from "@/app/lib/cache-config";
import {
  fetchFeedEvents,
  fetchHomeFeedEvents,
} from "@/app/lib/events-feed-server";

export const revalidate = 900;

export async function GET(request: Request) {
  const scope = new URL(request.url).searchParams.get("scope");
  const load = scope === "home" ? fetchHomeFeedEvents : fetchFeedEvents;
  const { events, error } = await load();

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
