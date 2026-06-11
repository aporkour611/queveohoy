import Image from "next/image";
import Link from "next/link";
import type { UfcWeekContext } from "../lib/ufc-week";
import { partidoPath } from "../lib/event-slug";
import { safeRemoteImageUrl } from "../lib/remote-image";
import { ChannelBadges } from "./ChannelBadge";

type Props = {
  context: UfcWeekContext;
};

type PortraitProps = {
  src?: string | null;
  name: string;
  variant?: "inline" | "flank";
};

export function UfcFighterPortrait({
  src,
  name,
  variant = "inline",
}: PortraitProps) {
  const safe = safeRemoteImageUrl(src);
  const className =
    variant === "flank"
      ? "qvh-ufc-week-fighter qvh-ufc-week-fighter-flank"
      : "qvh-ufc-week-fighter";

  if (!safe) {
    const parts = name.trim().split(/\s+/);
    const initials =
      parts.length >= 2
        ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
        : name.slice(0, 2).toUpperCase();

    return (
      <span
        className={`${className} qvh-ufc-week-fighter-fallback`}
        aria-hidden
      >
        {initials}
      </span>
    );
  }

  const size = variant === "flank" ? 68 : 36;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={safe}
      alt=""
      width={size}
      height={size}
      className={className}
      loading="eager"
      decoding="async"
    />
  );
}

function fighterShortName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length <= 1) return name;
  return parts[parts.length - 1] ?? name;
}

type FlankProps = {
  src?: string | null;
  name: string;
  align: "left" | "right";
};

export function UfcFighterFlank({ src, name, align }: FlankProps) {
  return (
    <aside
      className={`qvh-ufc-week-flank qvh-ufc-week-flank-${align}`}
      aria-hidden
    >
      <UfcFighterPortrait src={src} name={name} variant="flank" />
      <span className="qvh-ufc-week-flank-name">{fighterShortName(name)}</span>
    </aside>
  );
}

/** Server Component — Semana de UFC Casablanca (Topuria main event). */
export function UfcWeekHero({ context }: Props) {
  const {
    kicker,
    headline,
    stageLabel,
    dateLabel,
    time,
    channels,
    venueLabel,
    mainEvent,
    fighter1,
    fighter2,
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
              width={28}
              height={28}
              className="qvh-ufc-week-logo"
            />
          </div>

          <div className="qvh-ufc-week-hero-main">
            <div className="qvh-ufc-week-hero-titleline">
              <p className="qvh-ufc-week-kicker">{kicker}</p>
              <h2 className="qvh-ufc-week-headline">{headline}</h2>
              <span className="qvh-ufc-week-stage-badge">{stageLabel}</span>
            </div>

            <div className="qvh-ufc-week-hero-meta">
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
      </Link>
    </section>
  );
}
