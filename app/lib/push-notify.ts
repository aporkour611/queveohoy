import webpush from "web-push";
import type { EventRow } from "../components/types";
import { partidoPath } from "./event-slug";
import { eventDisplayTitle } from "./event-display";
import { resolveChannelsForEvent } from "./channels";
import { displayTime, madridDateTimeToUtc, toMadridDateKey } from "./madrid-time";
import {
  normalizePushTopics,
  subscriptionMatchesEvent,
  type PushTopicId,
} from "./push-preferences";
import { createSupabaseAdmin } from "./supabase-admin";
import {
  getVapidPrivateKey,
  getVapidPublicKey,
  getVapidSubject,
  isPushConfigured,
} from "./push-vapid";
import { siteUrl } from "./seo";

export const PUSH_NOTIFY_LEAD_MINUTES = 45;
export const PUSH_NOTIFY_WINDOW_MINUTES = 12;
export const PUSH_MAX_NOTIFIES_PER_DAY = 2;

type PushSubscriptionRow = {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  topics: unknown;
  notify_count_date: string | null;
  notify_count: number;
};

let vapidConfigured = false;

function ensureVapid() {
  if (vapidConfigured) return;
  const publicKey = getVapidPublicKey();
  const privateKey = getVapidPrivateKey();
  if (!publicKey || !privateKey) {
    throw new Error("VAPID keys missing");
  }
  webpush.setVapidDetails(getVapidSubject(), publicKey, privateKey);
  vapidConfigured = true;
}

function eventNotificationCopy(event: EventRow): { title: string; body: string } {
  const title = eventDisplayTitle(event);
  const time = displayTime(event.time);
  const channels =
    resolveChannelsForEvent(event).join(" · ") ||
    event.platform?.trim() ||
    "Consulta horario en la web";

  const competition = event.competition?.split(" · ")[0]?.trim();
  const body = competition
    ? `${time} · ${competition} · ${channels}`
    : `${time} · ${channels}`;

  return { title, body };
}

function eventStartsInWindow(
  event: EventRow,
  now: Date,
  leadMinutes: number,
  windowMinutes: number
): boolean {
  if (!event.date || !event.time) return false;

  const start = madridDateTimeToUtc(event.date, event.time);
  const diffMs = start.getTime() - now.getTime();
  const diffMin = diffMs / 60_000;

  const minLead = leadMinutes - windowMinutes / 2;
  const maxLead = leadMinutes + windowMinutes / 2;
  return diffMin >= minLead && diffMin <= maxLead;
}

async function markSubscriptionDailyCount(
  row: PushSubscriptionRow,
  todayKey: string
): Promise<number> {
  const admin = createSupabaseAdmin();
  const sameDay = row.notify_count_date === todayKey;
  const nextCount = sameDay ? row.notify_count + 1 : 1;

  await admin
    .from("push_subscriptions")
    .update({
      notify_count_date: todayKey,
      notify_count: nextCount,
      updated_at: new Date().toISOString(),
    })
    .eq("id", row.id);

  return nextCount;
}

async function sendToSubscription(
  row: PushSubscriptionRow,
  event: EventRow,
  todayKey: string
): Promise<"sent" | "skipped" | "expired"> {
  const admin = createSupabaseAdmin();
  const topics = normalizePushTopics(row.topics);

  if (!subscriptionMatchesEvent(topics, event.sport)) {
    return "skipped";
  }

  const sameDay = row.notify_count_date === todayKey;
  if (sameDay && row.notify_count >= PUSH_MAX_NOTIFIES_PER_DAY) {
    return "skipped";
  }

  const { data: alreadySent } = await admin
    .from("push_sent")
    .select("event_id")
    .eq("subscription_id", row.id)
    .eq("event_id", event.id)
    .maybeSingle();

  if (alreadySent) return "skipped";

  ensureVapid();
  const copy = eventNotificationCopy(event);
  const url = `${siteUrl}${partidoPath(event)}`;

  try {
    await webpush.sendNotification(
      {
        endpoint: row.endpoint,
        keys: { p256dh: row.p256dh, auth: row.auth },
      },
      JSON.stringify({
        title: `Empieza pronto: ${copy.title}`,
        body: copy.body,
        url,
        tag: `qvh-event-${event.id}`,
      })
    );
  } catch (error) {
    const status = (error as { statusCode?: number }).statusCode;
    if (status === 404 || status === 410) {
      await admin.from("push_subscriptions").delete().eq("id", row.id);
      return "expired";
    }
    throw error;
  }

  await admin.from("push_sent").upsert({
    subscription_id: row.id,
    event_id: event.id,
    sent_at: new Date().toISOString(),
  });

  await markSubscriptionDailyCount(row, todayKey);
  return "sent";
}

export async function dispatchPushForEvents(
  events: EventRow[],
  now = new Date()
): Promise<{
  ok: boolean;
  configured: boolean;
  candidates: number;
  sent: number;
  skipped: number;
  expired: number;
  errors: string[];
}> {
  if (!isPushConfigured()) {
    return {
      ok: true,
      configured: false,
      candidates: 0,
      sent: 0,
      skipped: 0,
      expired: 0,
      errors: [],
    };
  }

  const todayKey = toMadridDateKey(now);

  const candidates = events.filter((event) =>
    eventStartsInWindow(
      event,
      now,
      PUSH_NOTIFY_LEAD_MINUTES,
      PUSH_NOTIFY_WINDOW_MINUTES
    )
  );

  if (candidates.length === 0) {
    return {
      ok: true,
      configured: true,
      candidates: 0,
      sent: 0,
      skipped: 0,
      expired: 0,
      errors: [],
    };
  }

  const admin = createSupabaseAdmin();
  const { data: subscriptions, error } = await admin
    .from("push_subscriptions")
    .select(
      "id, endpoint, p256dh, auth, topics, notify_count_date, notify_count"
    );

  if (error) {
    return {
      ok: false,
      configured: true,
      candidates: candidates.length,
      sent: 0,
      skipped: 0,
      expired: 0,
      errors: [error.message],
    };
  }

  let sent = 0;
  let skipped = 0;
  let expired = 0;
  const errors: string[] = [];

  for (const event of candidates) {
    for (const row of (subscriptions ?? []) as PushSubscriptionRow[]) {
      try {
        const result = await sendToSubscription(row, event, todayKey);
        if (result === "sent") sent += 1;
        else if (result === "skipped") skipped += 1;
        else if (result === "expired") expired += 1;
      } catch (cause) {
        errors.push(
          `${row.id.slice(0, 8)}… event ${event.id}: ${
            cause instanceof Error ? cause.message : String(cause)
          }`
        );
      }
    }
  }

  return {
    ok: errors.length === 0,
    configured: true,
    candidates: candidates.length,
    sent,
    skipped,
    expired,
    errors,
  };
}

export type PushSubscriptionPayload = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  topics?: PushTopicId[];
  userAgent?: string | null;
};

export async function upsertPushSubscription(
  payload: PushSubscriptionPayload
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  if (!payload.endpoint || !payload.keys.p256dh || !payload.keys.auth) {
    return { ok: false, error: "Suscripción incompleta" };
  }

  const admin = createSupabaseAdmin();
  const topics = normalizePushTopics(payload.topics);

  const { data, error } = await admin
    .from("push_subscriptions")
    .upsert(
      {
        endpoint: payload.endpoint,
        p256dh: payload.keys.p256dh,
        auth: payload.keys.auth,
        topics,
        user_agent: payload.userAgent?.slice(0, 512) ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "endpoint" }
    )
    .select("id")
    .single();

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, id: data.id as string };
}

export async function deletePushSubscription(
  endpoint: string
): Promise<{ ok: boolean; error?: string }> {
  const admin = createSupabaseAdmin();
  const { error } = await admin
    .from("push_subscriptions")
    .delete()
    .eq("endpoint", endpoint);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
