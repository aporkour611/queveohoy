"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { EventRow } from "./types";
import { ChannelBadges } from "./ChannelBadge";
import { Logo } from "./Logo";
import { SiteFooter } from "./SiteFooter";
import { resolveChannelsForEvent } from "../lib/channels";
import { getFreeLiveBroadcast, isEventLiveNow } from "../lib/event-live";
import { eventLabel } from "../lib/seo-events";
import { displayTime } from "../lib/madrid-time";
import type { LivePlayerEmbed } from "../lib/live-player";
import { partidoPath } from "../lib/event-slug";
import { formatDisplayDateLabel, MADRID_TZ } from "../lib/timezone";
import { useLiveClock } from "../lib/use-live-clock";

type Props = {
  event: EventRow;
  player: LivePlayerEmbed;
};

export function LiveWatchPage({ event, player }: Props) {
  const now = useLiveClock(30_000);
  const isLive = useMemo(() => isEventLiveNow(event, now), [event, now]);
  const live = useMemo(() => getFreeLiveBroadcast(event, now), [event, now]);
  const channels = resolveChannelsForEvent(event);
  const dateLabel = event.date
    ? formatDisplayDateLabel(event.date, MADRID_TZ)
    : "";

  return (
    <div className="fh-body fh-live-page">
      <nav className="fh-navbar">
        <div className="fh-navbar-inner">
          <Logo />
          <div className="fh-nav-links">
            <Link href="/" className="fh-seo-hub-back">
              Volver a la agenda
            </Link>
          </div>
        </div>
      </nav>

      <main className="fh-content fh-live-main">
        <div className="fh-container fh-live-container">
          <nav className="fh-seo-breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Inicio</Link>
            <span aria-hidden>›</span>
            <span aria-current="page">En directo</span>
          </nav>

          <header className="fh-live-header">
            <p className="fh-live-kicker">
              <span className="qvh-live-dot" aria-hidden />
              {isLive ? "Retransmisión en directo" : "Emisión en directo"}
            </p>
            <h1 className="fh-live-title">{eventLabel(event)}</h1>
            <p className="fh-live-meta">
              {[
                event.competition?.split(" · ")[0],
                dateLabel,
                event.time ? displayTime(event.time) : null,
                player.channel,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
            {channels.length > 0 ? (
              <ChannelBadges
                channels={channels}
                variant="inline"
                liveChannel={live?.channel ?? player.channel}
              />
            ) : null}
          </header>

          <div className="fh-live-stage">
            {player.embedSrc ? (
              <div className="fh-live-player-wrap">
                <iframe
                  src={player.embedSrc}
                  title={player.playerTitle}
                  className="fh-live-player"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              </div>
            ) : (
              <div className="fh-live-fallback">
                <p>
                  Este canal no permite incrustar el vídeo aquí. Ábrelo en{" "}
                  <strong>{player.channel}</strong> para ver la retransmisión.
                </p>
                <a
                  href={player.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="fh-btn fh-btn-primary fh-live-fallback-btn"
                >
                  Ver en {player.channel}
                </a>
              </div>
            )}

            {!isLive ? (
              <p className="fh-live-ended">
                La franja en directo de este evento ya ha terminado.{" "}
                <Link href={partidoPath(event)}>Ver ficha del evento</Link>
              </p>
            ) : null}
          </div>

          <p className="fh-seo-hub-cta">
            <Link href="/">Ver toda la agenda →</Link>
          </p>

          <SiteFooter />
        </div>
      </main>
    </div>
  );
}
