import Link from "next/link";
import type { EventRow } from "./types";
import {
  buildDisplayDays,
  filterEventsInWeek,
  mapEventsToTimezone,
  MADRID_TZ,
} from "../lib/timezone";
import { FEED_DAY_COUNT } from "../lib/events-feed";
import { displayTime } from "../lib/madrid-time";
import { eventLabel } from "../lib/seo-events";
import { partidosHoyDatePath } from "../lib/seo-date";
import { hubLinkForEvent } from "./SeoHubLinks";

function eventMeta(event: EventRow): string {
  const parts = [
    event.competition?.split(" · ")[0],
    event.time ? displayTime(event.time) : null,
    event.platform?.split(",")[0]?.trim(),
  ].filter(Boolean);
  return parts.join(" · ");
}

type Props = {
  events: EventRow[];
};

/** Texto indexable con la agenda semanal para buscadores y accesibilidad. */
export function HomeEventOutline({ events }: Props) {
  const displayEvents = filterEventsInWeek(
    mapEventsToTimezone(events, MADRID_TZ),
    MADRID_TZ,
    FEED_DAY_COUNT
  ).slice(0, 40);

  const days = buildDisplayDays(MADRID_TZ, FEED_DAY_COUNT)
    .map((day) => ({
      ...day,
      events: displayEvents.filter((event) => event.date === day.date),
    }))
    .filter((day) => day.events.length > 0);

  if (days.length === 0) return null;

  return (
    <section className="fh-seo-outline" aria-label="Agenda completa en texto">
      <h2 className="fh-seo-outline-title">Agenda TV y streaming esta semana</h2>
      {days.map((day) => (
        <div key={day.date} className="fh-seo-outline-day">
          <h3 id={`seo-day-${day.date}`}>
            <Link href={partidosHoyDatePath(day.date)}>{day.title}</Link>
          </h3>
          <ul>
            {day.events.map((event) => {
              const hub = hubLinkForEvent(event);

              return (
                <li key={event.id}>
                  <strong>{eventLabel(event)}</strong>
                  {eventMeta(event) ? ` — ${eventMeta(event)}` : ""}
                  {hub ? (
                    <>
                      {" "}
                      ·{" "}
                      <Link href={`/${hub.slug}`}>{hub.title}</Link>
                    </>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </section>
  );
}
