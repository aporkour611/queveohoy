import type { EventRow } from "../components/types";
import { pickTodayDestacados } from "./destacados-config";
import { FEED_EVENT_SELECT, normalizeFeedEvents } from "./events-feed";
import { toMadridDateKey } from "./madrid-time";
import { dispatchPushForEvents } from "./push-notify";
import { createSupabaseAdmin } from "./supabase-admin";

export async function runPushCron(now = new Date()) {
  const todayKey = toMadridDateKey(now);
  const admin = createSupabaseAdmin();

  const { data, error } = await admin
    .from("events")
    .select(FEED_EVENT_SELECT)
    .eq("date", todayKey)
    .order("time", { ascending: true });

  if (error) {
    return {
      ok: false,
      todayKey,
      destacados: 0,
      push: null,
      error: error.message,
    };
  }

  const events = normalizeFeedEvents((data ?? []) as EventRow[]);
  const destacados = pickTodayDestacados(events, { todayKey });
  const push = await dispatchPushForEvents(destacados, now);

  return {
    ok: push.ok,
    todayKey,
    destacados: destacados.length,
    push,
    error: push.errors[0],
  };
}
