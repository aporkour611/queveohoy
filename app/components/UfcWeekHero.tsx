import Image from "next/image";
import Link from "next/link";
import type { UfcWeekContext } from "../lib/ufc-week";
import { partidoPath } from "../lib/event-slug";
import { safeRemoteImageUrl } from "../lib/remote-image";
import { ChannelBadges } from "./ChannelBadge";

type Props = {
  context: UfcWeekContext;
};

function FighterPortrait({
  src,
  name,
}: {
  src?: string | null;
  name: string;
}) {
  const safe = safeRemoteImageUrl(src);
  if (!safe) {
    const parts = name.trim().split(/\s+/);
    const initials =
      parts.length >= 2
        ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
        : name.slice(0, 2).toUpperCase();

    return (
      <span className="qvh-ufc-week-fighter qvh-ufc-week-fighter-fallback" aria-hidden>
        {initials}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={safe}
      alt=""
      width={36}
      height={36}
      className="qvh-ufc-week-fighter"
      loading="eager"
      decoding="async"
    />
  );
}

/** Server Component — Semana de UFC Casablanca (Topuria main event). */
export function UfcWeekHero({ context }: Props) {
  const {
    kicker,
    headline,
    stageLabel,
    fighter1,
    fighter2,
    fighter1Image,
    fighter2Image,
    dateLabel,
    time,
    channels,
    venueLabel,
    mainEvent,
  } = context;

  const partidoHref = partidoPath(mainEvent);

  return (
    <section className="qvh-ufc-week-hero" aria-label="Semana de UFC Casablanca">
      <div className="qvh-ufc-week-hero-bg" aria-hidden>
        <span className="qvh-ufc-week-hero-glow" />
        <span className="qvh-ufc-week-hero-grid" />
      </div>

      <Link
        href={partidoHref}
        className="qvh-ufc-week-hero-link"
        aria-label={`Ver ficha: ${fighter1} vs ${fighter2}`}
      >
        <div className="qvh-ufc-week-hero-inner">
          <div className="qvh-ufc-week-emblem" aria-hidden>
            <Image
              src="/competition-logos/ufc.svg"
              alt=""
              width={30}
              height={30}
              className="qvh-ufc-week-logo"
            />
          </div>

          <div className="qvh-ufc-week-hero-main">
            <div className="qvh-ufc-week-hero-titleline">
              <p className="qvh-ufc-week-kicker">{kicker}</p>
              <h2 className="qvh-ufc-week-headline">{headline}</h2>
              <span className="qvh-ufc-week-stage-badge">{stageLabel}</span>
            </div>

            <div className="qvh-ufc-week-hero-detail">
              <div className="qvh-ufc-week-matchup">
                <div className="qvh-ufc-week-side">
                  <FighterPortrait src={fighter1Image} name={fighter1} />
                  <span className="qvh-ufc-week-fighter-name">{fighter1}</span>
                </div>
                <span className="qvh-ufc-week-vs">VS</span>
                <div className="qvh-ufc-week-side">
                  <FighterPortrait src={fighter2Image} name={fighter2} />
                  <span className="qvh-ufc-week-fighter-name">{fighter2}</span>
                </div>
              </div>

              <div className="qvh-ufc-week-meta">
                <span className="qvh-ufc-week-venue">{venueLabel}</span>
                {dateLabel ? (
                  <span className="qvh-ufc-week-date">{dateLabel}</span>
                ) : null}
                {time ? <span className="qvh-ufc-week-time">{time}</span> : null}
                {channels.length > 0 ? (
                  <ChannelBadges channels={channels} variant="spotlight" />
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </section>
  );
}
