import type { CronEventInput } from "./cron-events";
import { buildCuratedSpanishTvCronEvents } from "./curated-tv-events";
import { toMadridDateKey } from "./madrid-time";
import { fetchRtveFlagshipEvents } from "./rtve-schedule";
import { fetchTvmazeByShowEvents, fetchTvmazeSpainEvents } from "./tvmaze-schedule";

type ScheduleCronEvent = CronEventInput & {
  external_id: string;
};

function mergeScheduleEvents(
  ...lists: ScheduleCronEvent[][]
): ScheduleCronEvent[] {
  const byId = new Map<string, ScheduleCronEvent>();

  for (const list of lists) {
    for (const event of list) {
      const existing = byId.get(event.external_id);
      if (!existing) {
        byId.set(event.external_id, event);
        continue;
      }
      byId.set(event.external_id, {
        ...existing,
        ...event,
        time: event.time || existing.time,
        platform: event.platform || existing.platform,
      });
    }
  }

  return [...byId.values()];
}

/** Parrilla TV España: TVmaze (lineal) + RTVE (programas públicos). */
export async function fetchSpanishTvScheduleEvents(
  dayCount = 7
): Promise<{ events: CronEventInput[]; error?: string }> {
  const todayKey = toMadridDateKey(new Date());
  const [tvmaze, tvmazeShows, rtve] = await Promise.all([
    fetchTvmazeSpainEvents(dayCount),
    fetchTvmazeByShowEvents(dayCount),
    fetchRtveFlagshipEvents(dayCount),
  ]);

  const curated = buildCuratedSpanishTvCronEvents(todayKey, dayCount);
  const errors = [tvmaze.error, tvmazeShows.error, rtve.error].filter(Boolean);
  const events = mergeScheduleEvents(
    tvmaze.events as ScheduleCronEvent[],
    tvmazeShows.events as ScheduleCronEvent[],
    rtve.events as ScheduleCronEvent[],
    curated as ScheduleCronEvent[]
  );

  return {
    events,
    error: errors.length ? errors.join(" | ") : undefined,
  };
}
