import { NextResponse } from "next/server"
import { isAdminRequest } from "@/app/lib/admin-auth"
import {
  isPartnerWebhookHistoryStoreConfigured,
  loadPartnerWebhookHistory,
} from "@/app/lib/partner-webhook-history-store"
import { PRODUCT_VERSION } from "@/app/lib/product-version"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const url = new URL(request.url)
  const limit = Number.parseInt(url.searchParams.get("limit") ?? "20", 10)

  const entries = await loadPartnerWebhookHistory(
    Number.isFinite(limit) ? limit : 20
  )

  return NextResponse.json({
    version: PRODUCT_VERSION,
    storeConfigured: isPartnerWebhookHistoryStoreConfigured(),
    entries,
  })
}
