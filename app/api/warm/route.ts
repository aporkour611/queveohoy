import { NextResponse } from "next/server"
import { enforceApiRateLimit, rateLimitResponse } from "@/app/lib/api-rate-limit"
import { runKeepWarmCycle } from "@/app/lib/keep-warm"
import { isTrustedWarmRequest } from "@/app/lib/warm-auth"

export const dynamic = "force-dynamic"
export const maxDuration = 60

/**
 * Mantiene calientes Vercel (funciones + ISR) y Supabase (consultas periódicas).
 * Cron Vercel: cada minuto. GitHub Actions: cada 5 min (respaldo).
 */
export async function GET(request: Request) {
  if (!isTrustedWarmRequest(request)) {
    const rate = await enforceApiRateLimit(request, "warm", 20, 60_000)
    if (!rate.ok) return rateLimitResponse(rate.retryAfterSec)
  }

  const warmOrigins = new URL(request.url).searchParams.get("origins") !== "0"
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
