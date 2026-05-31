import { NextResponse } from "next/server"
import { isAdminRequest } from "@/app/lib/admin-auth"
import { buildCronMetricsSummary } from "@/app/lib/cron-metrics"
import { loadLastCronRun, isCronLastRunStoreConfigured } from "@/app/lib/cron-last-run-store"
import { runHealthProbes, healthIsReady } from "@/app/lib/health-checks"
import { getIntegrationStatus } from "@/app/lib/integration-status"
import { PRODUCT_VERSION } from "@/app/lib/product-version"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const [lastRun, probes] = await Promise.all([
    loadLastCronRun(),
    runHealthProbes(),
  ])

  const metrics = buildCronMetricsSummary(
    (lastRun?.result ?? null) as Parameters<typeof buildCronMetricsSummary>[0]
  )

  return NextResponse.json({
    version: PRODUCT_VERSION,
    storeConfigured: isCronLastRunStoreConfigured(),
    lastRun: lastRun
      ? {
          savedAt: lastRun.savedAt,
          metrics,
        }
      : null,
    live: {
      feedReady: healthIsReady(probes),
      feedEventCount: probes.feedEventCount,
      database: probes.database,
      feedError: probes.feedError,
    },
    integrations: getIntegrationStatus(),
  })
}
