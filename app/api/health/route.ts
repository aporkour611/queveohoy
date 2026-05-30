import { NextResponse } from "next/server"
import { isCronAuthorized } from "@/app/lib/admin-auth"
import {
  getIntegrationStatus,
  integrationScore,
} from "@/app/lib/integration-status"
import {
  healthIsReady,
  runHealthProbes,
} from "@/app/lib/health-checks"
import { log } from "@/app/lib/logger"
import { PRODUCT_VERSION } from "@/app/lib/product-version"
import { isSupabaseConfigured } from "@/app/lib/supabase-config"

export const dynamic = "force-dynamic"

/** Integraciones solo con Bearer CRON_SECRET (nunca query params públicos). */
function isDetailedHealthRequest(request: Request): boolean {
  return isCronAuthorized(request)
}

export async function GET(request: Request) {
  const probes = await runHealthProbes()
  const ready = healthIsReady(probes)
  const detailed = isDetailedHealthRequest(request)

  const body: Record<string, unknown> = {
    ok: ready,
    service: "queveohoy",
    version: PRODUCT_VERSION,
    supabase: isSupabaseConfigured(),
    checks: {
      database: probes.database,
      feed: probes.feed,
      feedEventCount: probes.feedEventCount,
    },
    timestamp: new Date().toISOString(),
  }

  if (detailed) {
    const integrations = getIntegrationStatus()
    body.integrations = integrations
    body.integrationScore = integrationScore(integrations)
  }

  if (probes.feedError) {
    body.feedError = probes.feedError
  }

  if (!ready) {
    log.warn("health.not_ready", {
      database: probes.database,
      feed: probes.feed,
      feedEventCount: probes.feedEventCount,
    })
  }

  return NextResponse.json(body, {
    status: ready ? 200 : 503,
    headers: {
      "Cache-Control": "no-store",
    },
  })
}
