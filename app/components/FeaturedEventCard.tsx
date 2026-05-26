"use client";

import type { EventRow } from "./types";
import { getSpotlightCardModel } from "../lib/featured-card";
import { useTimezone } from "../lib/timezone-context";
import { FavoriteHeartButton } from "./FavoriteHeartButton";

type Props = {
  event: EventRow;
  className?: string;
};

export function FeaturedEventCard({ event, className }: Props) {
  const { timeZone } = useTimezone();
  const card = getSpotlightCardModel(event, timeZone);
  const rootClass = ["qvh-spotlight-card", className].filter(Boolean).join(" ");

  return (
    <article className={rootClass}>
      <div
        className={`qvh-spotlight-visual ${card.visualClass ?? ""}`}
        style={
          card.poster && !card.showTeamDuel
            ? { backgroundImage: `url(${card.poster})` }
            : undefined
        }
      >
        <FavoriteHeartButton eventId={event.id} />
        <div className="qvh-spotlight-overlay" />

        {card.showTeamDuel && card.homeCrest && card.awayCrest ? (
          <div className="qvh-spotlight-duel" aria-hidden>
            <div className="qvh-spotlight-duel-team">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={card.homeCrest} alt="" className="qvh-spotlight-crest" />
              <span className="qvh-spotlight-duel-name">{card.homeName}</span>
            </div>
            <span className="qvh-spotlight-duel-vs">vs</span>
            <div className="qvh-spotlight-duel-team">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={card.awayCrest} alt="" className="qvh-spotlight-crest" />
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
          <span className="qvh-spotlight-time">{card.time}</span>
        </div>
      </div>

      <div className="qvh-spotlight-body">
        <h3 className="qvh-spotlight-headline">{card.headline}</h3>
        {card.meta ? <p className="qvh-spotlight-meta">{card.meta}</p> : null}
        {card.platform && card.platform !== card.meta ? (
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
}
