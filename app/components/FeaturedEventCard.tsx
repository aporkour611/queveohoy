import Image from "next/image";
import { memo } from "react";
import type { EventRow } from "./types";
import { getSpotlightCardModel } from "../lib/featured-card";
import type { SpotlightCover } from "../lib/spotlight-art";
import { getEventCardStamp, isChampionsFinal } from "../lib/event-card-stamp";
import { MADRID_TZ } from "../lib/timezone";
import {
  buildSpotlightImageProps,
  spotlightCoverImageStyle,
} from "../lib/optimized-image";
import { safeRemoteImageUrl } from "../lib/remote-image";
import { RemotePoster } from "./RemotePoster";
import { TeamCrest } from "./TeamCrest";
import { UfcFightVisual } from "./UfcFightVisual";
import { RolandGarrosDuelVisual } from "./RolandGarrosDuelVisual";
import { EventCardStamp } from "./EventCardStamp";
import { ChannelBadges } from "./ChannelBadge";

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
  const coverClass = `qvh-spotlight-cover ${layoutClass}`;
  const imgClass = cover.local
    ? "qvh-spotlight-cover-img"
    : "qvh-remote-poster-img";
  const imgStyle = spotlightCoverImageStyle(cover.objectPosition);

  const built = buildSpotlightImageProps(cover.url, priority);
  if (built) {
    return (
      <div className={coverClass} aria-hidden>
        <Image
          {...built.props}
          alt=""
          className={imgClass}
          style={imgStyle}
          fetchPriority={priority ? "high" : undefined}
        />
      </div>
    );
  }

  const safeSrc = safeRemoteImageUrl(cover.url);
  if (priority && safeSrc) {
    return (
      <div className={coverClass} aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={safeSrc}
          alt=""
          className={imgClass}
          style={imgStyle}
          decoding="async"
          fetchPriority="high"
        />
      </div>
    );
  }

  return (
    <RemotePoster
      src={cover.url}
      className={coverClass}
      priority={priority}
      objectPosition={cover.objectPosition}
      sizeVariant="spotlight"
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
  const isClFinal = isChampionsFinal(event);
  const rootClass = [
    "qvh-spotlight-card",
    isClFinal ? "qvh-spotlight-card--cl-final" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={rootClass}>
      <div
        className={`qvh-spotlight-visual ${card.visualClass ?? ""}${
          card.showUfcDuel ? " qvh-spotlight-visual-ufc-duel" : ""
        }${card.showRolandGarrosDuel ? " qvh-spotlight-visual-rg-duel" : ""}${
          stamp ? " qvh-spotlight-visual-stamped" : ""
        }`}
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
        ) : card.showRolandGarrosDuel || card.showTennisDuel ? (
          <RolandGarrosDuelVisual
            homeName={card.homeName}
            awayName={card.awayName}
            size="spotlight"
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
          className={`qvh-spotlight-badge qvh-spotlight-badge-${
            card.showRolandGarrosDuel || card.showTennisDuel ? "rg" : card.badgeVariant
          }`}
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
