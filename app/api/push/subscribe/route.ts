import { NextResponse } from "next/server";
import {
  deletePushSubscription,
  upsertPushSubscription,
} from "../../../lib/push-notify";
import { isPushConfigured } from "../../../lib/push-vapid";
import type { PushTopicId } from "../../../lib/push-preferences";
import { checkRateLimit, clientIp } from "../../../lib/rate-limit";

type SubscribeBody = {
  endpoint?: string;
  keys?: { p256dh?: string; auth?: string };
  topics?: PushTopicId[];
  userAgent?: string;
};

export async function POST(request: Request) {
  const rate = checkRateLimit(`push:subscribe:${clientIp(request)}`, 20, 60_000);
  if (!rate.ok) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes" },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSec) } }
    );
  }

  if (!isPushConfigured()) {
    return NextResponse.json(
      { error: "Push no configurado en el servidor" },
      { status: 503 }
    );
  }

  let body: SubscribeBody;
  try {
    body = (await request.json()) as SubscribeBody;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const result = await upsertPushSubscription({
    endpoint: body.endpoint ?? "",
    keys: {
      p256dh: body.keys?.p256dh ?? "",
      auth: body.keys?.auth ?? "",
    },
    topics: body.topics,
    userAgent: body.userAgent ?? request.headers.get("user-agent"),
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: result.id });
}

export async function DELETE(request: Request) {
  let endpoint = new URL(request.url).searchParams.get("endpoint");

  if (!endpoint) {
    try {
      const body = (await request.json()) as { endpoint?: string };
      endpoint = body.endpoint ?? null;
    } catch {
      endpoint = null;
    }
  }

  if (!endpoint) {
    return NextResponse.json({ error: "Falta endpoint" }, { status: 400 });
  }

  const result = await deletePushSubscription(endpoint);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
