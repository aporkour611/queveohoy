import Link from "next/link";
import type { ReactNode } from "react";
import type { UfcWeekContext } from "../lib/ufc-week";
import { partidoPath } from "../lib/event-slug";
import { safeRemoteImageUrl } from "../lib/remote-image";
import { ChannelBadges } from "./ChannelBadge";

type Props = {
  context: UfcWeekContext;
  children?: ReactNode;
};

type PortraitProps = {
  src?: string | null;
  name: string;
  variant?: "corner" | "poster";
  priority?: boolean;
};

export function UfcFighterPortrait({
  src,
  name,
  variant = "poster",
  priority = false,
}: PortraitProps) {
  const safe = safeRemoteImageUrl(src);

  if (!safe) {
    const parts = name.trim().split(/\s+/);
    const initials =
      parts.length >= 2
        ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
        : name.slice(0, 2).toUpperCase();

    return (
      <span
        className={
          variant === "poster"
            ? "qvh-ufc-week-poster-fallback"
            : "qvh-ufc-week-corner-fallback"
        }
        aria-hidden
      >
        {initials}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={safe}
      alt=""
      className={
        variant === "poster"
          ? "qvh-ufc-week-poster-photo"
          : "qvh-ufc-week-corner-photo"
      }
      width={variant === "poster" ? 140 : 96}
      height={variant === "poster" ? 196 : 120}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "low"}
      decoding={priority ? "sync" : "async"}
    />
  );
}

function resolveWeightClass(context: UfcWeekContext): string | null {
  const competition = context.mainEvent.competition?.trim();
  if (!competition) return null;
  const tail = competition.split("·").pop()?.trim();
  if (!tail || /topuria|gaethje|vs/i.test(tail)) return null;
  return tail;
}

type FightPosterProps = {
  fighter1: string;
  fighter2: string;
  fighter1Image?: string | null;
  fighter2Image?: string | null;
};

function UfcWeekFightPoster({
  fighter1,
  fighter2,
  fighter1Image,
  fighter2Image,
}: FightPosterProps) {
  return (
    <div className="qvh-ufc-week-fight-poster" aria-hidden>
      <div className="qvh-ufc-week-poster-fighter qvh-ufc-week-poster-fighter-red">
        <div className="qvh-ufc-week-corner-photo-wrap qvh-ufc-week-poster-bust">
          <UfcFighterPortrait
            src={fighter1Image}
            name={fighter1}
            variant="poster"
            priority
          />
        </div>
        <p className="qvh-ufc-week-poster-name">{fighter1}</p>
      </div>

      <span className="qvh-ufc-week-vs-octagon qvh-ufc-week-poster-vs">VS</span>

      <div className="qvh-ufc-week-poster-fighter qvh-ufc-week-poster-fighter-blue">
        <div className="qvh-ufc-week-corner-photo-wrap qvh-ufc-week-poster-bust">
          <UfcFighterPortrait
            src={fighter2Image}
            name={fighter2}
            variant="poster"
          />
        </div>
        <p className="qvh-ufc-week-poster-name">{fighter2}</p>
      </div>
    </div>
  );
}

type CornerProps = {
  src?: string | null;
  name: string;
  align: "left" | "right";
};

function UfcFighterCorner({ src, name, align }: CornerProps) {
  const shortName = name.trim().split(/\s+/).pop() ?? name;

  return (
    <aside
      className={`qvh-ufc-week-corner qvh-ufc-week-corner-${align}`}
      aria-hidden
    >
      <div className="qvh-ufc-week-corner-photo-wrap">
        <span className="qvh-ufc-week-corner-glow" aria-hidden />
        <UfcFighterPortrait src={src} name={name} variant="corner" />
      </div>
      <p className="qvh-ufc-week-corner-name">{shortName}</p>
    </aside>
  );
}

/** Módulo editorial premium — Semana UFC Casablanca. */
export function UfcWeekFeature({ context, children }: Props) {
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
    fighter1Image,
    fighter2Image,
  } = context;

  const partidoHref = partidoPath(mainEvent);
  const weightClass = resolveWeightClass(context);

  return (
    <article className="qvh-ufc-week-shell" aria-label="Semana de UFC Casablanca">
      <Link
        href={partidoHref}
        className="qvh-ufc-week-lcp-link"
        aria-label={`Detalles del combate: ${fighter1} vs ${fighter2}`}
      >
        <UfcWeekFightPoster
          fighter1={fighter1}
          fighter2={fighter2}
          fighter1Image={fighter1Image}
          fighter2Image={fighter2Image}
        />
      </Link>

      <div className="qvh-ufc-week-shell-bg" aria-hidden>
        <span className="qvh-ufc-week-shell-spotlight" />
        <span className="qvh-ufc-week-shell-mesh" />
        <span className="qvh-ufc-week-shell-vignette" />
      </div>

      <div className="qvh-ufc-week-layout">
        <div className="qvh-ufc-week-main">
          <Link
            href={partidoHref}
            className="qvh-ufc-week-showcase"
            aria-label={`Detalles del combate: ${fighter1} vs ${fighter2}`}
          >
            <div className="qvh-ufc-week-showcase-bg" aria-hidden>
              <span className="qvh-ufc-week-showcase-sheen" />
            </div>

            <header className="qvh-ufc-week-showcase-head">
              <div className="qvh-ufc-week-brand">
                <span className="qvh-ufc-week-brand-logo" aria-hidden>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/competition-logos/ufc.svg"
                    alt=""
                    width={22}
                    height={22}
                    className="qvh-ufc-week-logo"
                    loading="lazy"
                    decoding="async"
                  />
                </span>
                <p className="qvh-ufc-week-kicker">{kicker}</p>
              </div>
              <h2 className="qvh-ufc-week-headline">{headline}</h2>
              <div className="qvh-ufc-week-badges">
                <span className="qvh-ufc-week-stage-badge">{stageLabel}</span>
                {weightClass ? (
                  <span className="qvh-ufc-week-weight-badge">{weightClass}</span>
                ) : null}
              </div>
            </header>

            <div className="qvh-ufc-week-showcase-meta">
              <span className="qvh-ufc-week-venue">{venueLabel}</span>
              {dateLabel ? (
                <span className="qvh-ufc-week-date">{dateLabel}</span>
              ) : null}
              {time ? <span className="qvh-ufc-week-time">{time}</span> : null}
              {channels.length > 0 ? (
                <ChannelBadges channels={channels} variant="spotlight" />
              ) : null}
            </div>

            <span className="qvh-ufc-week-cta">
              Detalles del combate
              <span aria-hidden>→</span>
            </span>
          </Link>

          {children ? (
            <div className="qvh-ufc-week-program">{children}</div>
          ) : null}
        </div>
      </div>
    </article>
  );
}

/** @deprecated Usar UfcWeekFeature */
export function UfcWeekHero({
  context,
}: {
  context: UfcWeekContext;
}) {
  return <UfcWeekFeature context={context} />;
}

/** @deprecated Flank integrado en UfcWeekFeature */
export function UfcFighterFlank({
  src,
  name,
  align,
}: {
  src?: string | null;
  name: string;
  align: "left" | "right";
}) {
  return <UfcFighterCorner src={src} name={name} align={align} />;
}
