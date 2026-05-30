import { NextRequest, NextResponse } from "next/server"
import { FEED_REVALIDATE_SECONDS } from "@/app/lib/cache-config"
import { fetchEventById } from "@/app/lib/events-feed-server"
import {
  enforcePublicApiRateLimitAsync,
  publicApiCorsHeaders,
  toPublicApiEvent,
} from "@/app/lib/public-api"

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: publicApiCorsHeaders(),
  })
}

export async function GET(request: NextRequest, context: RouteContext) {
  const rate = await enforcePublicApiRateLimitAsync(request)
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

  const { id: idParam } = await context.params
  const id = Number.parseInt(idParam, 10)
  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json(
      { error: "Invalid event id" },
      { status: 400, headers: publicApiCorsHeaders() }
    )
  }

  const { event, error } = await fetchEventById(id)
  if (error) {
    return NextResponse.json(
      { error, event: null },
      { status: 502, headers: publicApiCorsHeaders() }
    )
  }

  const publicEvent = event ? toPublicApiEvent(event) : null

  if (!publicEvent) {
    return NextResponse.json(
      { error: "Event not found" },
      { status: 404, headers: publicApiCorsHeaders() }
    )
  }

  return NextResponse.json(
    { version: "1", event: publicEvent },
    {
      headers: {
        ...publicApiCorsHeaders(),
        "Cache-Control": `public, s-maxage=${FEED_REVALIDATE_SECONDS}, stale-while-revalidate=${FEED_REVALIDATE_SECONDS * 2}`,
        Vary: "Accept-Encoding",
      },
    }
  )
}
