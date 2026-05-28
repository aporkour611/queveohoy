import Image from "next/image";
import Link from "next/link";
import "../roland-garros.css";
import { getSpotlightCardModel } from "../lib/featured-card";
import { partidoPath } from "../lib/event-slug";
import {
  buildSpotlightImageProps,
  spotlightCoverImageStyle,
} from "../lib/optimized-image";
import { safeRemoteImageUrl } from "../lib/remote-image";
import { MADRID_TZ } from "../lib/timezone";
import type { EventRow } from "./types";
import { RolandGarrosDuelVisual } from "./RolandGarrosDuelVisual";

type Props = {
  event: EventRow;
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
  const imgClass = local ? "qvh-spotlight-cover-img" : "qvh-remote-poster-img";
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
      />
    );
  }

  const safeSrc = safeRemoteImageUrl(url);
  if (!safeSrc) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={safeSrc} alt="" className={imgClass} style={style} loading="lazy" decoding="async" />
  );
}

function StaticCrest({ src, name }: { src?: string | null; name?: string | null }) {
  const safe = safeRemoteImageUrl(src);
  if (!safe) {
    return (
      <span className="fh-crest-fallback" aria-hidden>
        {(name ?? "?").slice(0, 2).toUpperCase()}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={safe} alt="" className="fh-crest-fallback fh-team-crest-img" loading="lazy" />
  );
}

export function MatchCardStatic({ event }: Props) {
  const card = getSpotlightCardModel(event, MADRID_TZ);
  const href = partidoPath(event);
  const visualClass = (card.visualClass ?? "").replace(
    "qvh-spotlight-visual-",
    "fh-media-spotlight-visual-"
  );
  const showTeamDuel = card.showTeamDuel && (card.homeName || card.awayName);
  const showRolandGarrosDuel =
    card.showRolandGarrosDuel && card.homeName && card.awayName;

  return (
    <Link
      href={href}
      className={`fh-match-card fh-match-media-spotlight${
        showRolandGarrosDuel ? " fh-match_rolandgarros" : ""
      }`}
    >
      <article className={`fh-media-spotlight ${visualClass}`}>
        <div className="fh-media-spotlight-body">
          <span className="fh-media-spotlight-badge">{card.badge}</span>
          <h4 className="fh-media-spotlight-title">{card.headline}</h4>
          {card.meta ? (
            <p className="fh-media-spotlight-subtitle">{card.meta}</p>
          ) : null}
          <p className="fh-media-spotlight-meta">
            <span>{card.dateLabel}</span>
            <span className="fh-media-spotlight-time">{card.time}</span>
          </p>
          {card.channelList && card.channelList.length > 0 ? (
            <div className="fh-media-spotlight-channels">
              {card.channelList.map((channel) => (
                <span key={channel} className="fh-channel-pill">
                  {channel}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        {showRolandGarrosDuel ? (
          <div
            className={`fh-media-spotlight-visual ${visualClass}`}
            aria-hidden
          >
            <RolandGarrosDuelVisual
              homeName={card.homeName}
              awayName={card.awayName}
              size="card"
            />
            <div className="fh-media-spotlight-overlay" />
          </div>
        ) : showTeamDuel ? (
          <div className="fh-m-logos fh-media-spotlight-duel" aria-hidden>
            <StaticCrest src={card.homeCrest} name={card.homeName} />
            <span className="fh-m-time">{card.time}</span>
            <StaticCrest src={card.awayCrest} name={card.awayName} />
          </div>
        ) : card.coverImage ? (
          <div className="fh-media-spotlight-banner" aria-hidden>
            <StaticCover
              url={card.coverImage.url}
              local={card.coverImage.local}
              objectPosition={card.coverImage.objectPosition}
            />
          </div>
        ) : null}
      </article>
    </Link>
  );
}
