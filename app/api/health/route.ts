import { NextResponse } from "next/server"
import {
  getIntegrationStatus,
  integrationScore,
} from "@/app/lib/integration-status"
import { PRODUCT_VERSION } from "@/app/lib/product-version"
import { isSupabaseConfigured } from "@/app/lib/supabase-config"

export const dynamic = "force-dynamic"

export async function GET() {
  const integrations = getIntegrationStatus()
  const score = integrationScore(integrations)

  return NextResponse.json(
    {
      ok: true,
      service: "queveohoy",
      version: PRODUCT_VERSION,
      supabase: isSupabaseConfigured(),
      integrations,
      integrationScore: score,
      timestamp: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  )
}
