"use client";

import { memo, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { EventRow } from "./types";
import { getSpotlightCardModel } from "../lib/featured-card";
import type { SpotlightCover } from "../lib/spotlight-art";
import { getEventCardStamp } from "../lib/event-card-stamp";
import { MADRID_TZ } from "../lib/timezone";
import { RemotePoster } from "./RemotePoster";
import { TeamCrest } from "./TeamCrest";
import { UfcFightVisual } from "./UfcFightVisual";
import { EventCardStamp } from "./EventCardStamp";
import { ChannelBadges } from "./ChannelBadge";
import { EventLiveBadge } from "./EventLiveBadge";
import { getFreeLiveBroadcast } from "../lib/event-live";
import { livePath } from "../lib/event-slug";
import { useLiveClock } from "../lib/use-live-clock";

type Props = {
  event: EventRow;
  className?: string;
  priority?: boolean;
};

function SpotlightCoverArt({
  cover,
  priority = false,
  esports = false,
}: {
  cover: SpotlightCover;
  priority?: boolean;
  esports?: boolean;
}) {
  const layoutClass = `qvh-spotlight-cover-${cover.layout}${
    esports ? " qvh-spotlight-cover-esports" : ""
  }`;

  if (cover.local) {
    return (
      <div
        className={`qvh-spotlight-cover ${layoutClass}`}
        aria-hidden
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cover.url}
          alt=""
          className="qvh-spotlight-cover-img"
          loading={priority ? "eager" : "lazy"}
          decoding="async"
        />
      </div>
    );
  }

  return (
    <RemotePoster
      src={cover.url}
      className={`qvh-spotlight-cover ${layoutClass}`}
      priority={priority}
    />
  );
}

export const FeaturedEventCard = memo(function FeaturedEventCard({
  event,
  className,
  priority = false,
}: Props) {
  const card = getSpotlightCardModel(event, MADRID_TZ);
  const stamp = getEventCardStamp(event);
  const now = useLiveClock();
  const live = useMemo(() => getFreeLiveBroadcast(event, now), [event, now]);
  const router = useRouter();
  const rootClass = [
    "qvh-spotlight-card",
    live ? "qvh-spotlight-card-live" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  function openLive() {
    if (live) router.push(livePath(event));
  }

  return (
    <article
      className={rootClass}
      role={live ? "button" : undefined}
      tabIndex={live ? 0 : undefined}
      onClick={live ? openLive : undefined}
      onKeyDown={
        live
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openLive();
              }
            }
          : undefined
      }
    >
      <div
        className={`qvh-spotlight-visual ${card.visualClass ?? ""}${
          card.showUfcDuel ? " qvh-spotlight-visual-ufc-duel" : ""
        }${stamp ? " qvh-spotlight-visual-stamped" : ""}`}
      >
        {stamp ? <EventCardStamp kind={stamp} size="compact" /> : null}
        {card.coverImage ? (
          <SpotlightCoverArt
            cover={card.coverImage}
            priority={priority}
            esports={card.badgeVariant === "esports"}
          />
        ) : null}
        <div className="qvh-spotlight-overlay" />

        {card.showUfcDuel ? (
          <UfcFightVisual
            f1Url={card.homeCrest}
            f2Url={card.awayCrest}
            f1Name={card.homeName}
            f2Name={card.awayName}
            size="spotlight"
            eager={priority}
          />
        ) : card.showTeamDuel ? (
          <div className="qvh-spotlight-duel" aria-hidden>
            <div className="qvh-spotlight-duel-team">
              <TeamCrest
                src={card.homeCrest}
                srcList={card.homeCrestList}
                name={card.homeName}
                size={48}
                className="qvh-spotlight-crest"
                eager={priority}
              />
              <span className="qvh-spotlight-duel-name">{card.homeName}</span>
            </div>
            <span className="qvh-spotlight-duel-vs">vs</span>
            <div className="qvh-spotlight-duel-team">
              <TeamCrest
                src={card.awayCrest}
                srcList={card.awayCrestList}
                name={card.awayName}
                size={48}
                className="qvh-spotlight-crest"
                eager={priority}
              />
              <span className="qvh-spotlight-duel-name">{card.awayName}</span>
            </div>
          </div>
        ) : null}

        <span
          className={`qvh-spotlight-badge qvh-spotlight-badge-${card.badgeVariant}`}
        >
          {card.badge}
        </span>
        <div className="qvh-spotlight-when">
          <span className="qvh-spotlight-date">{card.dateLabel}</span>
          {card.time ? (
            <span className="qvh-spotlight-time">{card.time}</span>
          ) : null}
        </div>
      </div>

      <div className="qvh-spotlight-body">
        <h3 className="qvh-spotlight-headline">{card.headline}</h3>
        {card.meta ? <p className="qvh-spotlight-meta">{card.meta}</p> : null}
        <EventLiveBadge
          event={event}
          variant="spotlight"
          watchPath={livePath(event)}
        />
        {card.channelList?.length ? (
          <ChannelBadges channels={card.channelList} variant="spotlight" />
        ) : card.platform && card.platform !== card.meta ? (
          <p
            className={`qvh-spotlight-platform ${
              card.badgeVariant === "champions"
                ? "qvh-spotlight-platform-champions"
                : card.badgeVariant === "premiere"
                  ? "qvh-spotlight-platform-premiere"
                  : ""
            }`}
          >
            {card.platform}
          </p>
        ) : null}
      </div>
    </article>
  );
});
