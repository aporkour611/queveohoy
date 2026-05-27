"use client";

import Link from "next/link";
import type { EventRow } from "./types";
import { MatchCard } from "./MatchCard";
import { SiteFooter } from "./SiteFooter";
import { Logo } from "./Logo";
import { eventLabel } from "../lib/seo-events";
import { displayTime } from "../lib/madrid-time";
import { ChannelBadges } from "./ChannelBadge";
import { resolveChannelsForEvent } from "../lib/channels";
import { formatDisplayDateLabel, MADRID_TZ } from "../lib/timezone";

type Props = {
  event: EventRow;
};

export function PartidoPage({ event }: Props) {
  const channels = resolveChannelsForEvent(event);
  const dateLabel = event.date
    ? formatDisplayDateLabel(event.date, MADRID_TZ)
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
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
          {channels.length > 0 ? (
            <ChannelBadges
              channels={channels}
              variant="inline"
              className="fh-page-lead-channels"
            />
          ) : null}

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
