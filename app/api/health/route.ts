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
import { runKeepWarmCycle } from "@/app/lib/keep-warm"
import { log } from "@/app/lib/logger"
import { PRODUCT_VERSION } from "@/app/lib/product-version"
import { isSupabaseConfigured } from "@/app/lib/supabase-config"
import { isTrustedWarmRequest } from "@/app/lib/warm-auth"

export const dynamic = "force-dynamic"
export const maxDuration = 10

/** Integraciones solo con Bearer CRON_SECRET (nunca query params públicos). */
function isDetailedHealthRequest(request: Request): boolean {
  return isCronAuthorized(request)
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  if (url.searchParams.get("warm") === "1") {
    if (!isTrustedWarmRequest(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const warmOrigins = url.searchParams.get("origins") !== "0"
    const result = await runKeepWarmCycle({ warmOrigins })
    return NextResponse.json(
      {
        ok: result.ok,
        warm: true,
        version: PRODUCT_VERSION,
        data: result.data,
        origins: result.origins,
        ms: result.ms,
        timestamp: new Date().toISOString(),
      },
      {
        status: result.ok ? 200 : 503,
        headers: { "Cache-Control": "no-store" },
      }
    )
  }

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
