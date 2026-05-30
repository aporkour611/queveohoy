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
        "Cache-Control": `public, s-maxage=${FEED_REVALIDATE_SECONDS}, stale-while-revalidate=${FEED_REVALIDATE_SECONDS * 2}`,
        Vary: "Accept-Encoding",
      },
    }
  );
}
