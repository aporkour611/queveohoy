import "../futbolhoy-feed.css";
import { resolveStaticHomeFeedDay } from "../lib/home-feed-day-static";
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
          </section>
        </div>
      </div>
    </div>
  );
}
