import type { EventRow } from "../components/types";
import { HOME_SSR_DAY_COUNT } from "./home-feed-config";
import { mergeFeedEvents } from "./merge-feed-events";
import {
  filterEventsInWeek,
  MADRID_TZ,
} from "./timezone";
import {
  indexDisplayEventsByDate,
  resolveDayEventsAllFromIndex,
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

  // SEO: agenda completa publicable del día en HTML estático (sin recorte de portada).
  const todayEvents = resolveDayEventsAllFromIndex(
    eventsByDate,
    dayDate,
    new Set(),
    false
  );

  return {
    todayEvents,
    upcomingEvents: [],
    upcomingMessage: null,
  };
}
