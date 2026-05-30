import { NextRequest, NextResponse } from "next/server"
import { enforcePublicApiRateLimitAsync, publicApiCorsHeaders } from "@/app/lib/public-api"
import { handlePublicFeedGet } from "@/app/lib/public-feed-handler"

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: publicApiCorsHeaders(),
  })
}

export async function GET(request: NextRequest) {
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

  return handlePublicFeedGet(request, "1")
}
