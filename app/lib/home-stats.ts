import type { EventRow } from "../components/types";
import { isFreeTvChannel, parseChannels } from "./channels";
import { FEED_DAY_COUNT } from "./events-feed";
import {
  buildDisplayDays,
  filterEventsInWeek,
  mapEventsToTimezone,
} from "./timezone";

export type TodayStats = {
  total: number;
  freeCount: number;
  dayTitle: string;
  date: string;
};

export function countTodayStats(
  events: EventRow[],
  timeZone: string
): TodayStats {
  const days = buildDisplayDays(timeZone, FEED_DAY_COUNT);
  const today = days[0];
  const weekEvents = filterEventsInWeek(
    mapEventsToTimezone(events, timeZone),
    timeZone,
    FEED_DAY_COUNT
  );
  const todayEvents = weekEvents.filter((e) => e.date === today?.date);

  const freeCount = todayEvents.filter((event) =>
    parseChannels(event.platform).some(isFreeTvChannel)
  ).length;

  return {
    total: todayEvents.length,
    freeCount,
    dayTitle: today?.title ?? "Hoy",
    date: today?.date ?? "",
  };
}
