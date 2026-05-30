import Image from "next/image";
import Link from "next/link";
import type { ChampionsWeekContext } from "../lib/champions-week";
import { partidoPath } from "../lib/event-slug";
import { safeRemoteImageUrl } from "../lib/remote-image";
import { ChannelBadges } from "./ChannelBadge";

type Props = {
  context: ChampionsWeekContext;
};

function StaticCrest({ src, name }: { src?: string | null; name: string }) {
  const safe = safeRemoteImageUrl(src);
  if (!safe) {
    return (
      <span className="qvh-cl-week-crest qvh-cl-week-crest-fallback" aria-hidden>
        {name.slice(0, 2).toUpperCase()}
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={safe}
      alt=""
      width={28}
      height={28}
      className="qvh-cl-week-crest"
      loading="lazy"
      decoding="async"
    />
  );
}

/** Server Component — sin TeamCrest/EventCountdown client (TBT). */
export function ChampionsWeekHero({ context }: Props) {
  const {
    kicker,
    headline,
    stageLabel,
    homeTeam,
    awayTeam,
    homeCrest,
    awayCrest,
    dateLabel,
    time,
    channels,
    finalEvent,
  } = context;

  const partidoHref = partidoPath(finalEvent);

  return (
    <section className="qvh-cl-week-hero" aria-label="Semana de Champions League">
      <div className="qvh-cl-week-hero-bg" aria-hidden>
        <span className="qvh-cl-week-hero-glow" />
      </div>

      <Link
        href={partidoHref}
        className="qvh-cl-week-hero-link"
        aria-label={`Ver ficha: ${homeTeam} vs ${awayTeam}`}
      >
        <div className="qvh-cl-week-hero-inner">
          <div className="qvh-cl-week-emblem" aria-hidden>
            <Image
              src="/champions/ucl-trophy.svg"
              alt=""
              width={28}
              height={37}
              className="qvh-cl-week-trophy"
            />
          </div>

          <div className="qvh-cl-week-hero-main">
            <div className="qvh-cl-week-hero-titleline">
              <p className="qvh-cl-week-kicker">{kicker}</p>
              <h2 className="qvh-cl-week-headline">{headline}</h2>
              <span className="qvh-cl-week-stage-badge">{stageLabel}</span>
            </div>

            <div className="qvh-cl-week-hero-detail">
              <div className="qvh-cl-week-matchup">
                <div className="qvh-cl-week-team">
                  <StaticCrest src={homeCrest} name={homeTeam} />
                  <span className="qvh-cl-week-team-name">{homeTeam}</span>
                </div>
                <span className="qvh-cl-week-vs">VS</span>
                <div className="qvh-cl-week-team">
                  <StaticCrest src={awayCrest} name={awayTeam} />
                  <span className="qvh-cl-week-team-name">{awayTeam}</span>
                </div>
              </div>

              <div className="qvh-cl-week-meta">
                {dateLabel ? (
                  <span className="qvh-cl-week-date">{dateLabel}</span>
                ) : null}
                {time ? <span className="qvh-cl-week-time">{time}</span> : null}
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
