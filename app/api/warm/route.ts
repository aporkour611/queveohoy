import { NextResponse } from "next/server"
import { enforceApiRateLimit, rateLimitResponse } from "@/app/lib/api-rate-limit"
import { runKeepWarmCycle } from "@/app/lib/keep-warm"
import { isTrustedWarmRequest } from "@/app/lib/warm-auth"

export const dynamic = "force-dynamic"
/** Hobby Vercel: máx. 10s; warm ligero vía keep-warm-prod (GHA cada 5 min). */
export const maxDuration = 10

/**
 * Mantiene calientes Vercel (funciones + ISR) y Supabase (consultas periódicas).
 * Cron Vercel: desactivado en Hobby — ver .github/workflows/cron-schedule.yml
 */
export async function GET(request: Request) {
  if (!isTrustedWarmRequest(request)) {
    const rate = await enforceApiRateLimit(request, "warm", 20, 60_000)
    if (!rate.ok) return rateLimitResponse(rate.retryAfterSec)
  }

  const warmOrigins =
    new URL(request.url).searchParams.get("origins") === "1"
  const result = await runKeepWarmCycle({ warmOrigins })

  return NextResponse.json(
    {
      ok: result.ok,
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
