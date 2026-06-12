import { NextRequest, NextResponse } from "next/server";
import { FEED_REVALIDATE_SECONDS } from "@/app/lib/cache-config";
import {
  enforceApiRateLimit,
  rateLimitResponse,
} from "@/app/lib/api-rate-limit";
import {
  fetchFeedEvents,
  fetchHomeFeedEvents,
  fetchWeekViewFeedEvents,
} from "@/app/lib/events-feed-server";
import { buildFeedEtag, feedNotModified } from "@/app/lib/feed-etag";

export async function GET(request: NextRequest) {
  const rate = await enforceApiRateLimit(request, "events");
  if (!rate.ok) return rateLimitResponse(rate.retryAfterSec);

  const scope = request.nextUrl.searchParams.get("scope");
  const { events, error } =
    scope === "home"
      ? await fetchHomeFeedEvents()
      : scope === "week"
        ? await fetchWeekViewFeedEvents()
        : await fetchFeedEvents();

  if (error) {
    return NextResponse.json({ error, events: [] }, { status: 502 });
  }

  const etag = buildFeedEtag(events);
  const cacheScope =
    scope === "week" ? "week" : scope === "home" ? "home" : "full";

  if (feedNotModified(request, etag)) {
    return new NextResponse(null, {
      status: 304,
      headers: {
        ETag: etag,
        "Cache-Control": `public, max-age=${FEED_REVALIDATE_SECONDS}, s-maxage=${FEED_REVALIDATE_SECONDS}, stale-while-revalidate=${FEED_REVALIDATE_SECONDS * 2}`,
        "X-Feed-Scope": cacheScope,
      },
    });
  }

  return NextResponse.json(
    {
      events,
      scope:
        scope === "home"
          ? ("home" as const)
          : scope === "week"
            ? ("week" as const)
            : ("full" as const),
    },
    {
      headers: {
        ETag: etag,
        "Cache-Control": `public, max-age=${FEED_REVALIDATE_SECONDS}, s-maxage=${FEED_REVALIDATE_SECONDS}, stale-while-revalidate=${FEED_REVALIDATE_SECONDS * 2}`,
        Vary: "Accept-Encoding",
        "X-Feed-Scope": cacheScope,
      },
    }
  );
}
