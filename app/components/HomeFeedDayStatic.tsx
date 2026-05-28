import Link from "next/link";
import "../futbolhoy-feed.css";
import { countHiddenHomeEvents } from "../lib/featured";
import { resolveStaticHomeFeedDay } from "../lib/home-feed-day-static";
import { mergeFeedEvents } from "../lib/merge-feed-events";
import { HOME_SSR_DAY_COUNT } from "../lib/home-feed-config";
import { partidosHoyDatePath } from "../lib/seo-date";
import { filterEventsInWeek, MADRID_TZ } from "../lib/timezone";
import type { EventRow } from "./types";
import { EventDaySectionsStatic } from "./EventDaySectionsStatic";

type Props = {
  initialEvents: EventRow[];
  initialDestacadosEvents: EventRow[];
  dayDate: string;
};

/** Feed del día 0 en HTML estático (visible antes de hidratar HomeFeed). */
export function HomeFeedDayStatic({
  initialEvents,
  initialDestacadosEvents,
  dayDate,
}: Props) {
  const day = resolveStaticHomeFeedDay(
    initialEvents,
    initialDestacadosEvents,
    dayDate
  );
  const feedEvents = mergeFeedEvents(initialEvents, initialDestacadosEvents);
  const displayEvents = filterEventsInWeek(
    feedEvents,
    MADRID_TZ,
    HOME_SSR_DAY_COUNT
  );
  const rawDay = displayEvents.filter((event) => event.date === dayDate);
  const hiddenOnDay = countHiddenHomeEvents(rawDay, day.todayEvents);

  return (
    <div
      id="home-feed-day-ssr"
      className="fh-feed-area qvh-home-feed-day-ssr"
    >
      <div className="fh-day-feed" id="day-feed-ssr">
        <div className="fh-feed-pane fh-feed-pane-today">
          <section
            id={`day-${dayDate}`}
            className="fh-day-section fh-matchday"
            aria-labelledby={`day-title-${dayDate}`}
          >
            <EventDaySectionsStatic
              events={day.todayEvents}
              emptyMessage="Sin eventos este día."
            />
            {day.upcomingMessage ? (
              <p className="fh-upcoming-notice">{day.upcomingMessage}</p>
            ) : null}
            {day.upcomingEvents.length > 0 ? (
              <EventDaySectionsStatic events={day.upcomingEvents} />
            ) : null}
            {hiddenOnDay > 0 ? (
              <p className="fh-home-more-link">
                <Link href={partidosHoyDatePath(dayDate)}>
                  Ver todos los eventos ({hiddenOnDay} más) →
                </Link>
              </p>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
}
