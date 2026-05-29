import Image from "next/image";
import Link from "next/link";
import type { EventRow } from "./types";
import { getSpotlightCardModel } from "../lib/featured-card";
import { getEventCardStamp, isChampionsFinal } from "../lib/event-card-stamp";
import { partidoPath } from "../lib/event-slug";
import { MADRID_TZ } from "../lib/timezone";
import { buildLcpPosterUrl } from "../lib/lcp-poster";
import {
  buildSpotlightImageProps,
  spotlightCoverImageStyle,
} from "../lib/optimized-image";
import { safeRemoteImageUrl } from "../lib/remote-image";
import { EventCardStamp } from "./EventCardStamp";

type Props = {
  event: EventRow;
  className?: string;
  priority?: boolean;
};

function StaticSpotlightCover({
  url,
  local,
  objectPosition,
  priority = false,
}: {
  url: string;
  local: boolean;
  objectPosition?: string;
  priority?: boolean;
}) {
  const layoutClass = "qvh-spotlight-cover qvh-spotlight-cover-poster";
  const imgClass = local ? "qvh-spotlight-cover-img" : "qvh-remote-poster-img";
  const imgStyle = spotlightCoverImageStyle(objectPosition);

  if (priority) {
    const lcpSrc = buildLcpPosterUrl(url) ?? (local ? url : safeRemoteImageUrl(url));
    if (lcpSrc) {
      return (
        <div className={layoutClass} aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lcpSrc}
            alt=""
            className={imgClass}
            style={imgStyle}
            loading="eager"
            fetchPriority="high"
            decoding="sync"
            width={342}
            height={132}
          />
        </div>
      );
    }
  }

  const built = buildSpotlightImageProps(url, priority);

  if (built) {
    return (
      <div className={layoutClass} aria-hidden>
        <Image
          {...built.props}
          alt=""
          className={imgClass}
          style={imgStyle}
          fetchPriority={priority ? "high" : "auto"}
          loading={priority ? "eager" : "lazy"}
          priority={priority}
        />
      </div>
    );
  }

  const safeSrc = safeRemoteImageUrl(url);
  if (!safeSrc) return null;

  return (
    <div className={layoutClass} aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={safeSrc}
        alt=""
        className={imgClass}
        style={imgStyle}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
      />
    </div>
  );
}

/** Destacados SSR: sin client boundaries ni lazy observers. */
export function FeaturedEventCardStatic({
  event,
  className,
  priority = false,
}: Props) {
  const card = getSpotlightCardModel(event, MADRID_TZ);
  const stamp = getEventCardStamp(event);
  const isClFinal = isChampionsFinal(event);
  const href = partidoPath(event);
  const rootClass = [
    "qvh-spotlight-card",
    isClFinal ? "qvh-spotlight-card--cl-final" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Link href={href} className={rootClass}>
      <div
        className={`qvh-spotlight-visual ${card.visualClass ?? ""}${
          stamp ? " qvh-spotlight-visual-stamped" : ""
        }`}
      >
        {stamp ? <EventCardStamp kind={stamp} size="compact" /> : null}
        {card.coverImage ? (
          <StaticSpotlightCover
            url={card.coverImage.url}
            local={card.coverImage.local}
            objectPosition={card.coverImage.objectPosition}
            priority={priority}
          />
        ) : null}
        <div className="qvh-spotlight-overlay" aria-hidden />
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
        {card.platform && card.platform !== card.meta ? (
          <p className="qvh-spotlight-platform">{card.platform}</p>
        ) : null}
      </div>
    </Link>
  );
}
