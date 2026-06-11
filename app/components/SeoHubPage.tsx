import Link from "next/link";
import type { EventRow } from "./types";
import {
  buildDisplayDays,
  MADRID_TZ,
} from "../lib/timezone";
import { FEED_DAY_COUNT } from "../lib/events-feed";
import type { SeoHubConfig } from "../lib/seo-hubs";
import { HubWeekCtaLink } from "./HubWeekCtaLink";
import { filterEventsForHub } from "../lib/seo-hubs";
import { HubFaq } from "./HubFaq";
import { HubJsonLd } from "./HubJsonLd";
import { Logo } from "./Logo";
import { SeoDateNav } from "./SeoDateNav";
import { SeoHubLinks } from "./SeoHubLinks";
import { PageMain } from "./PageMain";
import { SiteFooter } from "./SiteFooter";
import { SeoGuidesPromo } from "./SeoGuidesPromo";
import { SeoHubEventFeed } from "./SeoHubEventFeed";

type Props = {
  hub: SeoHubConfig;
  events: EventRow[];
  weekAgendaCount?: number;
};

export function SeoHubPage({ hub, events, weekAgendaCount = 0 }: Props) {
  const filtered = filterEventsForHub(events, hub);
  const dayCount = hub.dayScope === "today" ? 1 : FEED_DAY_COUNT;

  const days = buildDisplayDays(MADRID_TZ, dayCount)
    .map((day) => ({
      ...day,
      events: filtered.filter((event) => event.date === day.date),
    }))
    .filter((day) => day.events.length > 0);

  const totalEvents = filtered.length;

  return (
    <>
      <HubJsonLd hub={hub} events={filtered} />
      <div className="fh-body">
        <header className="fh-header-shell">
        <nav className="fh-navbar" aria-label="Navegación del hub">
          <div className="fh-navbar-inner">
            <Logo />
            <div className="fh-nav-links">
              <Link href="/" className="fh-seo-hub-back" prefetch>
                Agenda completa
              </Link>
            </div>
          </div>
        </nav>
        </header>

        <PageMain className="fh-content">
          <div className="fh-container fh-main fh-seo-hub-page">
            <nav className="fh-seo-breadcrumb" aria-label="Breadcrumb">
              <Link href="/">Inicio</Link>
              <span aria-hidden>›</span>
              <span aria-current="page">{hub.title}</span>
            </nav>

            <h1 className="fh-page-title">{hub.h1}</h1>
            <p className="fh-page-lead">{hub.lead}</p>
            {weekAgendaCount > 0 && hub.dayScope !== "today" ? (
              <p className="fh-seo-hub-week-meta">
                Agenda global:{" "}
                <strong>{weekAgendaCount} eventos</strong> esta semana en Madrid.
              </p>
            ) : null}

            {totalEvents > 0 ? (
              <div className="qvh-calendar-hero-stats qvh-calendar-hero-stats-hub">
                <span className="qvh-calendar-stat qvh-calendar-stat-count">
                  {totalEvents === 1
                    ? "1 evento"
                    : `${totalEvents} eventos`}
                  {hub.dayScope === "today" ? " hoy" : " esta semana"}
                </span>
              </div>
            ) : null}

            <p className="fh-seo-hub-cta">
              <HubWeekCtaLink>
                Ver semana completa en la agenda →
              </HubWeekCtaLink>
              {" · "}
              <Link href="/explorar" prefetch>
                Explorar categorías
              </Link>
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
              <SeoHubEventFeed days={days} hubTitle={hub.title} />
            )}

            {hub.slug === "partidos-hoy" ? <SeoDateNav /> : null}

            <HubFaq slug={hub.slug} />
            <SeoHubLinks current={hub.slug} />
          </div>
          <SeoGuidesPromo />
          <SiteFooter />
        </PageMain>
      </div>
    </>
  );
}
