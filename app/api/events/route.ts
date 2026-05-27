import { NextRequest, NextResponse } from "next/server";
import { FEED_REVALIDATE_SECONDS } from "@/app/lib/cache-config";
import {
  fetchFeedEvents,
  fetchHomeFeedEvents,
} from "@/app/lib/events-feed-server";

export async function GET(request: NextRequest) {
  const isHome = request.nextUrl.searchParams.get("scope") === "home";
  const { events, error } = isHome
    ? await fetchHomeFeedEvents()
    : await fetchFeedEvents();

  if (error) {
    return NextResponse.json({ error, events: [] }, { status: 502 });
  }

  return NextResponse.json(
    { events, scope: isHome ? ("home" as const) : ("full" as const) },
    {
      headers: {
        "Cache-Control": `public, s-maxage=${FEED_REVALIDATE_SECONDS}, stale-while-revalidate=${FEED_REVALIDATE_SECONDS * 2}`,
        Vary: "Accept-Encoding",
      },
    }
  );
}
