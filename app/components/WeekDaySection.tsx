"use client";

import { memo, useMemo } from "react";
import type { EventRow } from "./types";
import { resolveDayEventsAllFromIndex } from "../lib/upcoming-events";
import { useLazyInView } from "../lib/use-lazy-in-view";
import { EventDaySections } from "./EventDaySections";

type DayMeta = {
  date: string;
  label: string;
  num: number;
  month: string;
  title: string;
};

type Props = {
  day: DayMeta;
  dayIndex: number;
  activeDay: number;
  isFeaturedMode: boolean;
  eventsByDate: Map<string, EventRow[]>;
  sportFilter: Set<string>;
  featuredMode: boolean;
  appliedSports?: string[];
};

export const WeekDaySection = memo(function WeekDaySection({
  day,
  dayIndex,
  activeDay,
  isFeaturedMode,
  eventsByDate,
  sportFilter,
  featuredMode,
  appliedSports = [],
}: Props) {
  const eager = dayIndex === 0 || dayIndex === activeDay || dayIndex === activeDay + 1;
  const { ref, inView } = useLazyInView({ eager, rootMargin: "720px 0px" });
  const shouldRenderFeed = eager || inView;

  const events = useMemo(() => {
    if (!shouldRenderFeed) return [];
    return resolveDayEventsAllFromIndex(
      eventsByDate,
      day.date,
      sportFilter,
      featuredMode
    );
  }, [shouldRenderFeed, eventsByDate, day.date, sportFilter, featuredMode]);

  return (
    <section
      id={`day-week-${day.date}`}
      className="fh-day-section fh-matchday qvh-content-auto"
      aria-labelledby={`day-week-title-${day.date}`}
    >
      <h2 id={`day-week-title-${day.date}`} className="fh-matchday-header">
        {day.title}
      </h2>

      <div ref={ref}>
        {shouldRenderFeed ? (
          <EventDaySections
            events={events}
            priority={dayIndex === activeDay ? "high" : "normal"}
            appliedSports={appliedSports}
            isFeaturedMode={isFeaturedMode}
            emptyMessage={
              isFeaturedMode
                ? "Sin eventos este día."
                : "Sin eventos para estos filtros."
            }
          />
        ) : (
          <div className="fh-day-lazy-placeholder" aria-hidden />
        )}
      </div>
    </section>
  );
});
