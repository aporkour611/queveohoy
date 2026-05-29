import type { SupabaseClient } from "@supabase/supabase-js";
import { toMadridDateKey } from "./madrid-time";

/** Eventos anteriores al calendario de hoy (Europe/Madrid). */
export function isPastEventDate(
  eventDate: string | null | undefined,
  todayKey: string
): boolean {
  if (!eventDate) return false;
  return eventDate < todayKey;
}

export function todayMadridDateKey(now = new Date()): string {
  return toMadridDateKey(now);
}

export async function purgePastDayEvents(
  supabase: SupabaseClient,
  todayKey = todayMadridDateKey()
): Promise<{ purged: number; todayKey: string; error?: string }> {
  const { data, error } = await supabase
    .from("events")
    .select("id")
    .lt("date", todayKey);

  if (error) {
    return { purged: 0, todayKey, error: error.message };
  }

  const ids = (data ?? []).map((row) => row.id as number);
  if (ids.length === 0) {
    return { purged: 0, todayKey };
  }

  const { error: delError } = await supabase.from("events").delete().in("id", ids);
  if (delError) {
    return { purged: 0, todayKey, error: delError.message };
  }

  return { purged: ids.length, todayKey };
}
