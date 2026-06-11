import { NextResponse } from "next/server"
import { isCronAuthorized } from "@/app/lib/admin-auth"
import { runCronJob } from "@/app/lib/cron/run-cron"
import { runKeepWarmCycle } from "@/app/lib/keep-warm"
import {
  isMadridMidnightHour,
  madridCalendarDay,
} from "@/app/lib/madrid-midnight"
import { PRODUCT_VERSION } from "@/app/lib/product-version"
import { rolloverDayContent } from "@/app/lib/revalidate-feed"
import { isTrustedWarmRequest } from "@/app/lib/warm-auth"

export const dynamic = "force-dynamic"
export const maxDuration = 120

/** Rollover diario 00:00 Europe/Madrid: purga, ingesta, invalida caché y calienta. */
export async function GET(request: Request) {
  if (!isCronAuthorized(request) && !isTrustedWarmRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const url = new URL(request.url)
  const force = url.searchParams.get("force") === "1"

  if (!force && !isMadridMidnightHour()) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: "not-midnight-madrid",
      calendarDay: madridCalendarDay(),
      version: PRODUCT_VERSION,
    })
  }

  await rolloverDayContent({ preload: false })

  const cronRequest = new Request(
    `${url.origin}/api/cron?phase=core`,
    { headers: request.headers }
  )
  const cronResponse = await runCronJob(cronRequest)
  const cronResult = (await cronResponse.json()) as Record<string, unknown>

  const warm = await runKeepWarmCycle({ warmOrigins: true })
  const revalidate = await rolloverDayContent({ preload: true })

  return NextResponse.json(
    {
      ok: cronResponse.ok && warm.ok && revalidate.ok,
      rollover: true,
      calendarDay: madridCalendarDay(),
      version: PRODUCT_VERSION,
      cron: cronResult,
      warm: { ok: warm.ok, ms: warm.ms },
      revalidate,
      timestamp: new Date().toISOString(),
    },
    {
      status: cronResponse.ok ? 200 : 503,
      headers: { "Cache-Control": "no-store" },
    }
  )
}
