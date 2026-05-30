import { NextRequest, NextResponse } from "next/server";
import { FEED_REVALIDATE_SECONDS } from "@/app/lib/cache-config";
import {
  enforceApiRateLimit,
  rateLimitResponse,
} from "@/app/lib/api-rate-limit";
import { fetchHomeFeedEvents } from "@/app/lib/events-feed-server";

export async function GET(request: NextRequest) {
  const rate = await enforceApiRateLimit(request, "home-feed");
  if (!rate.ok) return rateLimitResponse(rate.retryAfterSec);
  const { events, error } = await fetchHomeFeedEvents();

  if (error) {
    return NextResponse.json({ error, events: [] }, { status: 502 });
  }

  return NextResponse.json(
    { events, scope: "home" as const },
    {
      headers: {
        "Cache-Control": `public, s-maxage=${FEED_REVALIDATE_SECONDS}, stale-while-revalidate=${FEED_REVALIDATE_SECONDS * 2}`,
      },
    }
  );
}
