import Link from "next/link";
import type { EventRow } from "./types";
import {
  buildDisplayDays,
  MADRID_TZ,
} from "../lib/timezone";
import { FEED_DAY_COUNT } from "../lib/events-feed";
import { displayTime } from "../lib/madrid-time";
import { eventLabel } from "../lib/seo-events";
import type { SeoHubConfig } from "../lib/seo-hubs";
import { filterEventsForHub } from "../lib/seo-hubs";
import { hubLinkForEvent } from "./SeoHubLinks";
import { HubJsonLd } from "./HubJsonLd";
import { Logo } from "./Logo";
import { SeoHubLinks } from "./SeoHubLinks";
import { SiteFooter } from "./SiteFooter";

function eventMeta(event: EventRow): string {
  const parts = [
    event.competition?.split(" · ")[0],
    event.time ? displayTime(event.time) : null,
    event.platform?.split(",")[0]?.trim(),
  ].filter(Boolean);
  return parts.join(" · ");
}

type Props = {
  hub: SeoHubConfig;
  events: EventRow[];
};

export function SeoHubPage({ hub, events }: Props) {
  const filtered = filterEventsForHub(events, hub);
  const dayCount = hub.dayScope === "today" ? 1 : FEED_DAY_COUNT;

  const days = buildDisplayDays(MADRID_TZ, dayCount)
    .map((day) => ({
      ...day,
      events: filtered.filter((event) => event.date === day.date),
    }))
    .filter((day) => day.events.length > 0);

  return (
    <>
      <HubJsonLd hub={hub} events={filtered} />
      <div className="fh-body">
        <nav className="fh-navbar">
          <div className="fh-navbar-inner">
            <Logo />
            <div className="fh-nav-links">
              <Link href="/" className="fh-seo-hub-back">
                Agenda completa
              </Link>
            </div>
          </div>
        </nav>

        <main className="fh-content">
          <div className="fh-container fh-main fh-seo-hub-page">
            <nav className="fh-seo-breadcrumb" aria-label="Breadcrumb">
              <Link href="/">Inicio</Link>
              <span aria-hidden>›</span>
              <span aria-current="page">{hub.title}</span>
            </nav>

            <h1 className="fh-page-title">{hub.h1}</h1>
            <p className="fh-page-lead">{hub.lead}</p>

            <p className="fh-seo-hub-cta">
              <Link href="/">Ver agenda interactiva con filtros →</Link>
            </p>

            {days.length === 0 ? (
              <div className="fh-empty">
                <p>
                  No hay eventos de {hub.title.toLowerCase()} en este momento.
                </p>
                <p>
                  <Link href="/">Consulta la agenda completa</Link> para ver
                  todos los eventos de la semana.
                </p>
              </div>
            ) : (
              <section
                className="fh-seo-outline fh-seo-hub-outline"
                aria-label={`Agenda de ${hub.title}`}
              >
                <h2 className="fh-seo-outline-title">
                  {hub.dayScope === "today"
                    ? "Horarios de hoy"
                    : "Horarios de esta semana"}
                </h2>
                {days.map((day) => (
                  <div key={day.date} className="fh-seo-outline-day">
                    <h3 id={`hub-day-${day.date}`}>{day.title}</h3>
                    <ul>
                      {day.events.map((event) => {
                        const relatedHub = hubLinkForEvent(event);
                        const showLink =
                          relatedHub && relatedHub.slug !== hub.slug;

                        return (
                          <li key={event.id}>
                            <strong>{eventLabel(event)}</strong>
                            {eventMeta(event) ? ` — ${eventMeta(event)}` : ""}
                            {showLink ? (
                              <>
                                {" "}
                                ·{" "}
                                <Link href={`/${relatedHub.slug}`}>
                                  {relatedHub.title}
                                </Link>
                              </>
                            ) : null}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </section>
            )}

            <SeoHubLinks current={hub.slug} />
            <SiteFooter />
          </div>
        </main>
      </div>
    </>
  );
}
