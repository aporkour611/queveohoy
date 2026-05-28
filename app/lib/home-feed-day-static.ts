import type { EventRow } from "../components/types";
import { HOME_SSR_DAY_COUNT } from "./home-feed-config";
import { mergeFeedEvents } from "./merge-feed-events";
import {
  buildDisplayDays,
  filterEventsInWeek,
  MADRID_TZ,
} from "./timezone";
import {
  indexDisplayEventsByDate,
  resolveFeaturedHomeDayEvents,
  type HomeDayEventsResult,
} from "./upcoming-events";

export function resolveStaticHomeFeedDay(
  initialEvents: EventRow[],
  initialDestacadosEvents: EventRow[],
  dayDate: string
): HomeDayEventsResult {
  const feedEvents = mergeFeedEvents(initialEvents, initialDestacadosEvents);
  const displayEvents = filterEventsInWeek(
    feedEvents,
    MADRID_TZ,
    HOME_SSR_DAY_COUNT
  );
  const eventsByDate = indexDisplayEventsByDate(displayEvents);
  const todayKey =
    buildDisplayDays(MADRID_TZ, HOME_SSR_DAY_COUNT)[0]?.date ?? dayDate;

  return resolveFeaturedHomeDayEvents(eventsByDate, dayDate, todayKey);
}
