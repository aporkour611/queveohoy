import { NextResponse } from "next/server"
import { publicApiErrorMessage } from "@/app/lib/api-error"
import { resolveRequestUser } from "@/app/lib/supabase/request-user"
import {
  deletePushSubscription,
  upsertExpoPushSubscription,
  upsertPushSubscription,
} from "../../../lib/push-notify"
import { isPushConfigured } from "../../../lib/push-vapid"
import type { PushTopicId } from "../../../lib/push-preferences"
import { checkRateLimitDistributed } from "../../../lib/rate-limit-distributed"
import { clientIp } from "../../../lib/rate-limit"

type SubscribeBody = {
  endpoint?: string
  keys?: { p256dh?: string; auth?: string }
  expoPushToken?: string
  platform?: "web" | "expo"
  topics?: PushTopicId[]
  userAgent?: string
  userId?: string | null
  favoritesOnly?: boolean
}

export async function POST(request: Request) {
  const ip = clientIp(request)
  const rate = await checkRateLimitDistributed(`push:subscribe:${ip}`, 20, 60_000)
  if (!rate.ok) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes" },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSec) } }
    )
  }

  let body: SubscribeBody
  try {
    body = (await request.json()) as SubscribeBody
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
  }

  const isExpoRequest =
    body.platform === "expo" || Boolean(body.expoPushToken?.trim())

  if (!isPushConfigured() && !isExpoRequest) {
    return NextResponse.json(
      { error: "Push no configurado en el servidor" },
      { status: 503 }
    )
  }

  const user = await resolveRequestUser(request)

  const result = isExpoRequest
    ? await upsertExpoPushSubscription({
        expoPushToken: body.expoPushToken ?? "",
        topics: body.topics,
        userAgent: body.userAgent ?? request.headers.get("user-agent"),
        userId: user?.id ?? null,
        favoritesOnly: body.favoritesOnly,
      })
    : await upsertPushSubscription({
        endpoint: body.endpoint ?? "",
        keys: {
          p256dh: body.keys?.p256dh ?? "",
          auth: body.keys?.auth ?? "",
        },
        topics: body.topics,
        userAgent: body.userAgent ?? request.headers.get("user-agent"),
        userId: user?.id ?? null,
        favoritesOnly: body.favoritesOnly,
      })

  if (!result.ok) {
    return NextResponse.json(
      { error: publicApiErrorMessage(result.error) },
      { status: 500 }
    )
  }

  return NextResponse.json({ ok: true, id: result.id })
}

export async function DELETE(request: Request) {
  const ip = clientIp(request)
  const rate = await checkRateLimitDistributed(`push:delete:${ip}`, 20, 60_000)
  if (!rate.ok) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes" },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSec) } }
    )
  }

  let endpoint = new URL(request.url).searchParams.get("endpoint")

  if (!endpoint) {
    try {
      const body = (await request.json()) as { endpoint?: string }
      endpoint = body.endpoint ?? null
    } catch {
      endpoint = null
    }
  }

  if (!endpoint) {
    return NextResponse.json({ error: "Falta endpoint" }, { status: 400 })
  }

  const result = await deletePushSubscription(endpoint)
  if (!result.ok) {
    return NextResponse.json(
      { error: publicApiErrorMessage(result.error) },
      { status: 500 }
    )
  }

  return NextResponse.json({ ok: true })
}
