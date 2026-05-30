import Link from "next/link";
import type { EventRow } from "./types";
import { DateJsonLd } from "./DateJsonLd";
import { Logo } from "./Logo";
import { SeoDateNav } from "./SeoDateNav";
import { SeoHubEventFeed } from "./SeoHubEventFeed";
import { SeoHubLinks } from "./SeoHubLinks";
import { PageMain } from "./PageMain";
import { SiteFooter } from "./SiteFooter";
import {
  buildDatePageLead,
  dayOffsetFromToday,
  filterEventsForDate,
  formatDateForMetadata,
} from "../lib/seo-date";
import { dayTitleInZone, MADRID_TZ } from "../lib/timezone";

type Props = {
  dateKey: string;
  events: EventRow[];
};

export function SeoDatePage({ dateKey, events }: Props) {
  const dayEvents = filterEventsForDate(events, dateKey);
  const offset = dayOffsetFromToday(dateKey);
  const dayTitle = dayTitleInZone(dateKey, offset, MADRID_TZ);
  const h1 = `Partidos ${formatDateForMetadata(dateKey)} en TV`;

  const days =
    dayEvents.length > 0
      ? [{ date: dateKey, title: dayTitle, events: dayEvents }]
      : [];

  return (
    <>
      <DateJsonLd dateKey={dateKey} events={events} />
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

        <PageMain className="fh-content">
          <div className="fh-container fh-main fh-seo-hub-page">
            <nav className="fh-seo-breadcrumb" aria-label="Breadcrumb">
              <Link href="/">Inicio</Link>
              <span aria-hidden>›</span>
              <Link href="/partidos-hoy">Partidos hoy en TV</Link>
              <span aria-hidden>›</span>
              <span aria-current="page">{formatDateForMetadata(dateKey)}</span>
            </nav>

            <h1 className="fh-page-title">{h1}</h1>
            <p className="fh-page-lead">{buildDatePageLead(dateKey, events)}</p>

            {dayEvents.length > 0 ? (
              <div className="qvh-calendar-hero-stats qvh-calendar-hero-stats-hub">
                <span className="qvh-calendar-stat qvh-calendar-stat-count">
                  {dayEvents.length === 1
                    ? "1 evento"
                    : `${dayEvents.length} eventos`}
                </span>
              </div>
            ) : null}

            <p className="fh-seo-hub-cta">
              <Link href="/">Ver agenda interactiva con filtros →</Link>
            </p>

            {days.length === 0 ? (
              <div className="fh-empty">
                <p>No hay partidos programados para este día.</p>
                <p>
                  <Link href="/partidos-hoy">Ver partidos de hoy</Link> o la{" "}
                  <Link href="/">agenda completa</Link>.
                </p>
              </div>
            ) : (
              <SeoHubEventFeed days={days} hubTitle={h1} />
            )}

            <SeoDateNav current={dateKey} />
            <SeoHubLinks />
          </div>
          <SiteFooter />
        </PageMain>
      </div>
    </>
  );
}
