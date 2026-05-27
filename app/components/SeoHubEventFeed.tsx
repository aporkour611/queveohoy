"use client";

import { EventDaySections } from "./EventDaySections";
import type { EventRow } from "./types";

type DaySection = {
  date: string;
  title: string;
  events: EventRow[];
};

type Props = {
  days: DaySection[];
  hubTitle: string;
};

export function SeoHubEventFeed({ days, hubTitle }: Props) {
  return (
    <section
      className="fh-seo-hub-feed"
      aria-label={`Agenda de ${hubTitle}`}
    >
      {days.map((day) => (
        <div key={day.date} className="fh-day-section fh-matchday">
          <h2 className="fh-matchday-header">{day.title}</h2>
          <EventDaySections events={day.events} />
        </div>
      ))}
    </section>
  );
}
