"use client";

import Link from "next/link";
import type { EventRow } from "./types";
import { MatchCard } from "./MatchCard";
import { SiteFooter } from "./SiteFooter";
import { Logo } from "./Logo";
import { TimezoneProvider } from "../lib/timezone-context";
import { eventLabel } from "../lib/seo-events";
import { displayTime } from "../lib/madrid-time";
import { resolveChannelsForEvent } from "../lib/channels";
import { formatDisplayDateLabel } from "../lib/timezone";
import { useTimezone } from "../lib/timezone-context";

type Props = {
  event: EventRow;
};

function PartidoDetail({ event }: Props) {
  const { timeZone } = useTimezone();
  const channels = resolveChannelsForEvent(event);
  const dateLabel = event.date
    ? formatDisplayDateLabel(event.date, timeZone)
    : "";

  return (
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
        <div className="fh-container fh-main fh-partido-page">
          <nav className="fh-seo-breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Inicio</Link>
            <span aria-hidden>›</span>
            <span aria-current="page">{eventLabel(event)}</span>
          </nav>

          <h1 className="fh-page-title">{eventLabel(event)}</h1>
          <p className="fh-page-lead">
            {[
              event.competition?.split(" · ")[0],
              dateLabel,
              event.time ? displayTime(event.time) : null,
              channels.length ? channels.join(", ") : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>

          <div className="fh-partido-card-wrap">
            <MatchCard event={event} />
          </div>

          <p className="fh-seo-hub-cta">
            <Link href="/">Ver toda la agenda de hoy →</Link>
          </p>

          <SiteFooter />
        </div>
      </main>
    </div>
  );
}

export function PartidoPage({ event }: Props) {
  return (
    <TimezoneProvider>
      <PartidoDetail event={event} />
    </TimezoneProvider>
  );
}
