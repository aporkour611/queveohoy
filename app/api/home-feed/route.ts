import { NextRequest, NextResponse } from "next/server";
import { FEED_REVALIDATE_SECONDS } from "@/app/lib/cache-config";
import {
  enforceApiRateLimit,
  rateLimitResponse,
} from "@/app/lib/api-rate-limit";
import { fetchHomeFeedEvents } from "@/app/lib/events-feed-server";
import { buildFeedEtag, feedNotModified } from "@/app/lib/feed-etag";

export async function GET(request: NextRequest) {
  const rate = await enforceApiRateLimit(request, "home-feed");
  if (!rate.ok) return rateLimitResponse(rate.retryAfterSec);
  const { events, error } = await fetchHomeFeedEvents();

  if (error) {
    return NextResponse.json({ error, events: [] }, { status: 502 });
  }

  const etag = buildFeedEtag(events);
  if (feedNotModified(request, etag)) {
    return new NextResponse(null, {
      status: 304,
      headers: {
        ETag: etag,
        "Cache-Control": `public, s-maxage=${FEED_REVALIDATE_SECONDS}, stale-while-revalidate=${FEED_REVALIDATE_SECONDS * 2}`,
      },
    });
  }

  return NextResponse.json(
    { events, scope: "home" as const },
    {
      headers: {
        ETag: etag,
        "Cache-Control": `public, s-maxage=${FEED_REVALIDATE_SECONDS}, stale-while-revalidate=${FEED_REVALIDATE_SECONDS * 2}`,
        Vary: "Accept-Encoding",
      },
    }
  );
}
