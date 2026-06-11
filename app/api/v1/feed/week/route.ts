import { NextRequest, NextResponse } from "next/server"
import { FEED_REVALIDATE_SECONDS } from "@/app/lib/cache-config"
import { fetchWeekViewFeedEvents } from "@/app/lib/events-feed-server"
import {
  enforcePublicFeedRateLimit,
} from "@/app/lib/partner-api"
import {
  buildPublicApiFeedResponse,
  publicApiCorsHeaders,
  toPublicApiEvents,
} from "@/app/lib/public-api"
import { getMadridTodayKey } from "@/app/lib/seo-date"
import { MADRID_TZ } from "@/app/lib/timezone"

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: publicApiCorsHeaders(),
  })
}

export async function GET(request: NextRequest) {
  const rate = await enforcePublicFeedRateLimit(request, {
    allowPartnerKeys: false,
  })

  if (!rate.ok) {
    return NextResponse.json(
      { error: "Rate limit exceeded", retryAfterSec: rate.retryAfterSec },
      {
        status: 429,
        headers: {
          ...publicApiCorsHeaders(),
          "Retry-After": String(rate.retryAfterSec),
        },
      }
    )
  }

  const { events, error } = await fetchWeekViewFeedEvents()
  if (error) {
    return NextResponse.json(
      { error, events: [] },
      { status: 502, headers: publicApiCorsHeaders() }
    )
  }

  const todayKey = getMadridTodayKey()
  const publicEvents = toPublicApiEvents(events)
  const body = buildPublicApiFeedResponse(
    publicEvents,
    todayKey,
    MADRID_TZ,
    null,
    undefined
  )

  return NextResponse.json(
    {
      ...body,
      scope: "week" as const,
      days: 7,
    },
    {
      headers: {
        ...publicApiCorsHeaders(),
        "Cache-Control": `public, s-maxage=${FEED_REVALIDATE_SECONDS}, stale-while-revalidate=${FEED_REVALIDATE_SECONDS * 2}`,
        Vary: "Accept-Encoding",
      },
    }
  )
}
