import { NextRequest, NextResponse } from "next/server"
import { publicApiCorsHeaders } from "@/app/lib/public-api"
import { handlePublicFeedGet } from "@/app/lib/public-feed-handler"

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: publicApiCorsHeaders(),
  })
}

export async function GET(request: NextRequest) {
  return handlePublicFeedGet(request, "1")
}
