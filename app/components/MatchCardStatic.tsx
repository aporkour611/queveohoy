import Image from "next/image";
import Link from "next/link";
import { getSpotlightCardModel } from "../lib/featured-card";
import { partidoPath } from "../lib/event-slug";
import {
  buildSpotlightImageProps,
  spotlightCoverImageStyle,
} from "../lib/optimized-image"
import { MADRID_TZ } from "../lib/timezone";
import type { EventRow } from "./types";
import {
  StaticRolandGarrosDuelVisual,
  StaticUfcFightVisual,
} from "./duel-visuals-static";
import { RemotePosterStatic } from "./RemotePosterStatic";
import { safeRemoteImageUrl } from "../lib/remote-image";

type Props = {
  event: EventRow;
  /** Sin póster en HTML estático (evita imágenes lazy que roban LCP). */
  omitCover?: boolean;
};

function StaticCover({
  url,
  local,
  objectPosition,
}: {
  url: string;
  local: boolean;
  objectPosition?: string;
}) {
  if (!local) {
    return (
      <RemotePosterStatic
        src={url}
        className="qvh-remote-poster qvh-spotlight-cover"
        objectPosition={objectPosition}
        sizeVariant="card"
      />
    );
  }

  const imgClass = "qvh-spotlight-cover-img";
  const style = spotlightCoverImageStyle(objectPosition);
  const built = buildSpotlightImageProps(url, false);

  if (built) {
    return (
      <Image
        {...built.props}
        alt=""
        className={imgClass}
        style={style}
        loading="lazy"
        fetchPriority="low"
      />
    );
  }

  const safeSrc = safeRemoteImageUrl(url);
  if (!safeSrc) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={safeSrc}
      alt=""
      className={imgClass}
      style={style}
      loading="lazy"
      fetchPriority="low"
      decoding="async"
    />
  );
}

function StaticCrest({ src }: { src?: string | null }) {
  const safe = safeRemoteImageUrl(src);
  if (!safe) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={safe} alt="" className="fh-team-crest-img" loading="lazy" />
  );
}

export function MatchCardStatic({ event, omitCover = false }: Props) {
  const card = getSpotlightCardModel(event, MADRID_TZ);
  const href = partidoPath(event);
  const visualClass = (card.visualClass ?? "").replace(
    "qvh-spotlight-visual-",
    "fh-media-spotlight-visual-"
  );
  const showTeamDuel =
    card.showTeamDuel &&
    Boolean(card.homeCrest && card.awayCrest);
  const showRolandGarrosDuel =
    card.showRolandGarrosDuel && card.homeName && card.awayName;
  const showUfcDuel =
    event.sport === "ufc" &&
    Boolean(
      card.showUfcDuel ||
        card.homeCrest ||
        card.awayCrest ||
        (card.homeName && card.awayName)
    );
  const matchExtra = showRolandGarrosDuel ? " fh-match_rolandgarros" : "";

  return (
    <Link
      href={href}
      className={`fh-match fh-match-media-spotlight${matchExtra}`}
    >
      <div
        className={`fh-media-spotlight-visual ${visualClass}${
          showUfcDuel ? " fh-media-spotlight-visual-ufc-duel" : ""
        }${showRolandGarrosDuel ? " fh-media-spotlight-visual-rg-duel" : ""}${
          showTeamDuel ? " fh-media-spotlight-visual-team-duel" : ""
        }`}
      >
        {card.coverImage && !showTeamDuel && !showRolandGarrosDuel && !omitCover ? (
          <StaticCover
            url={card.coverImage.url}
            local={card.coverImage.local}
            objectPosition={card.coverImage.objectPosition}
          />
        ) : null}
        {showUfcDuel ? (
          <StaticUfcFightVisual
            f1Url={card.homeCrest}
            f2Url={card.awayCrest}
            f1Name={card.homeName}
            f2Name={card.awayName}
            size="card"
          />
        ) : showRolandGarrosDuel ? (
          <StaticRolandGarrosDuelVisual
            homeName={card.homeName}
            awayName={card.awayName}
            size="card"
          />
        ) : showTeamDuel ? (
          <div className="fh-media-spotlight-duel" aria-hidden>
            <div className="fh-media-spotlight-duel-team">
              <StaticCrest src={card.homeCrest} />
              <span className="fh-media-spotlight-duel-name">{card.homeName}</span>
            </div>
            <span className="fh-media-spotlight-duel-vs">vs</span>
            <div className="fh-media-spotlight-duel-team">
              <StaticCrest src={card.awayCrest} />
              <span className="fh-media-spotlight-duel-name">{card.awayName}</span>
            </div>
          </div>
        ) : null}
        <div className="fh-media-spotlight-overlay" aria-hidden />
        <span className="fh-media-spotlight-badge">{card.badge}</span>
        <div className="fh-media-spotlight-when">
          {card.dateLabel ? (
            <span className="fh-media-spotlight-date">{card.dateLabel}</span>
          ) : null}
          {card.time ? (
            <span className="fh-media-spotlight-time">{card.time}</span>
          ) : null}
        </div>
      </div>

      <div className="fh-media-spotlight-body">
        <h4 className="fh-media-spotlight-title">{card.headline}</h4>
        {card.meta ? <p className="fh-media-spotlight-meta">{card.meta}</p> : null}
        {card.channelList && card.channelList.length > 0 ? (
          <p className="fh-media-spotlight-meta">{card.channelList.join(" · ")}</p>
        ) : null}
      </div>
    </Link>
  );
}
