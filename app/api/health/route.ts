import { NextResponse } from "next/server"
import { PRODUCT_VERSION } from "@/app/lib/product-version"
import { isSupabaseConfigured } from "@/app/lib/supabase-config"

export const dynamic = "force-dynamic"

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      service: "queveohoy",
      version: PRODUCT_VERSION,
      supabase: isSupabaseConfigured(),
      timestamp: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  )
}
