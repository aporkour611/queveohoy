import Image from "next/image";
import Link from "next/link";
import type { EventRow } from "./types";
import { getSpotlightCardModel } from "../lib/featured-card";
import { getEventCardStamp, isChampionsFinal } from "../lib/event-card-stamp";
import { partidoPath } from "../lib/event-slug";
import { MADRID_TZ } from "../lib/timezone";
import { resolveLcpLocalRasterUrl } from "../lib/lcp-local-poster";
import { buildLcpPosterUrl } from "../lib/lcp-poster";
import {
  buildSpotlightImageProps,
  SPOTLIGHT_IMAGE_HEIGHT,
  SPOTLIGHT_IMAGE_WIDTH,
  spotlightCoverImageStyle,
} from "../lib/optimized-image";
import { safeRemoteImageUrl } from "../lib/remote-image";
import {
  resolveTennisPlayerCountry,
  tennisFlagUrl,
} from "../lib/tennis-player-country";
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
    const lcpSrc = local
      ? resolveLcpLocalRasterUrl(url)
      : buildLcpPosterUrl(url) ?? safeRemoteImageUrl(url);
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
            width={SPOTLIGHT_IMAGE_WIDTH}
            height={SPOTLIGHT_IMAGE_HEIGHT}
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
        width={SPOTLIGHT_IMAGE_WIDTH}
        height={SPOTLIGHT_IMAGE_HEIGHT}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
      />
    </div>
  );
}

function StaticTeamCrest({ src }: { src?: string | null }) {
  const safe = safeRemoteImageUrl(src);
  if (!safe) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={safe} alt="" className="qvh-spotlight-crest fh-team-crest-img" loading="lazy" />
  );
}

function fighterInitials(name?: string | null): string {
  if (!name?.trim()) return "?";
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

function StaticUfcFightVisual({
  f1Url,
  f2Url,
  f1Name,
  f2Name,
  priority = false,
}: {
  f1Url?: string | null;
  f2Url?: string | null;
  f1Name?: string | null;
  f2Name?: string | null;
  priority?: boolean;
}) {
  const f1Safe = safeRemoteImageUrl(f1Url);
  const f2Safe = safeRemoteImageUrl(f2Url);

  return (
    <div className="qvh-ufc-duel" aria-hidden>
      <div className="qvh-ufc-fighter">
        <div className="fh-ufc-fighter-slot">
          {f1Safe ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={f1Safe}
              alt=""
              width={120}
              height={120}
              className="qvh-ufc-fighter-img"
              loading={priority ? "eager" : "lazy"}
              decoding="async"
            />
          ) : (
            <span className="fh-ufc-fighter-fallback">{fighterInitials(f1Name)}</span>
          )}
        </div>
      </div>
      <span className="qvh-ufc-vs">vs</span>
      <div className="qvh-ufc-fighter">
        <div className="fh-ufc-fighter-slot">
          {f2Safe ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={f2Safe}
              alt=""
              width={120}
              height={120}
              className="qvh-ufc-fighter-img"
              loading={priority ? "eager" : "lazy"}
              decoding="async"
            />
          ) : (
            <span className="fh-ufc-fighter-fallback">{fighterInitials(f2Name)}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function shortPlayerName(name?: string | null): string {
  if (!name?.trim()) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length <= 1) return parts[0];
  return parts[parts.length - 1];
}

function StaticRolandGarrosDuelVisual({
  homeName,
  awayName,
}: {
  homeName?: string | null;
  awayName?: string | null;
}) {
  const home = homeName?.trim();
  const away = awayName?.trim();
  if (!home && !away) return null;

  const homeCode = resolveTennisPlayerCountry(home);
  const awayCode = resolveTennisPlayerCountry(away);
  const homeFlag = tennisFlagUrl(homeCode);
  const awayFlag = tennisFlagUrl(awayCode);

  return (
    <div className="qvh-rg-duel" aria-hidden>
      <div className="qvh-rg-flags">
        <div
          className="qvh-rg-flag qvh-rg-flag-home"
          style={homeFlag ? { backgroundImage: `url("${homeFlag}")` } : undefined}
        />
        <div
          className="qvh-rg-flag qvh-rg-flag-away"
          style={awayFlag ? { backgroundImage: `url("${awayFlag}")` } : undefined}
        />
        <div className="qvh-rg-flags-center" />
        <div className="qvh-rg-ball" aria-hidden>
          <span className="qvh-rg-ball-core" />
        </div>
      </div>
      <div className="qvh-rg-players">
        <span className="qvh-rg-player qvh-rg-player-home">{shortPlayerName(home)}</span>
        <span className="qvh-rg-vs">vs</span>
        <span className="qvh-rg-player qvh-rg-player-away">{shortPlayerName(away)}</span>
      </div>
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
  const showTeamDuel =
    card.showTeamDuel && Boolean(card.homeCrest && card.awayCrest);
  const showVisual = Boolean(
    card.coverImage || card.showUfcDuel || card.showRolandGarrosDuel || showTeamDuel
  );
  const rootClass = [
    "qvh-spotlight-card",
    isClFinal ? "qvh-spotlight-card--cl-final" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Link href={href} className={rootClass}>
      {showVisual ? (
      <div
        className={`qvh-spotlight-visual ${card.visualClass ?? ""}${
          card.showUfcDuel ? " qvh-spotlight-visual-ufc-duel" : ""
        }${card.showRolandGarrosDuel || card.showTennisDuel ? " qvh-spotlight-visual-rg-duel" : ""}${
          showTeamDuel ? " fh-media-spotlight-visual-team-duel" : ""
        }${stamp ? " qvh-spotlight-visual-stamped" : ""}`}
      >
        {stamp ? <EventCardStamp kind={stamp} size="compact" /> : null}
        {card.coverImage && !showTeamDuel && !card.showUfcDuel && !card.showRolandGarrosDuel ? (
          <StaticSpotlightCover
            url={card.coverImage.url}
            local={card.coverImage.local}
            objectPosition={card.coverImage.objectPosition}
            priority={priority}
          />
        ) : null}
        {card.showUfcDuel ? (
          <StaticUfcFightVisual
            f1Url={card.homeCrest}
            f2Url={card.awayCrest}
            f1Name={card.homeName}
            f2Name={card.awayName}
            priority={priority}
          />
        ) : card.showRolandGarrosDuel || card.showTennisDuel ? (
          <StaticRolandGarrosDuelVisual
            homeName={card.homeName}
            awayName={card.awayName}
          />
        ) : showTeamDuel ? (
          <div className="qvh-spotlight-duel" aria-hidden>
            <div className="qvh-spotlight-duel-team">
              <StaticTeamCrest src={card.homeCrest} />
              <span className="qvh-spotlight-duel-name">{card.homeName}</span>
            </div>
            <span className="qvh-spotlight-duel-vs">vs</span>
            <div className="qvh-spotlight-duel-team">
              <StaticTeamCrest src={card.awayCrest} />
              <span className="qvh-spotlight-duel-name">{card.awayName}</span>
            </div>
          </div>
        ) : null}
        <div className="qvh-spotlight-overlay" aria-hidden />
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
      ) : null}

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
