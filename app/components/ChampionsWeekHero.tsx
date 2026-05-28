import Image from "next/image";
import type { ChampionsWeekContext } from "../lib/champions-week";
import { ChannelBadges } from "./ChannelBadge";

type Props = {
  context: ChampionsWeekContext;
};

export function ChampionsWeekHero({ context }: Props) {
  const { kicker, headline, stageLabel, homeTeam, awayTeam, dateLabel, time, channels } =
    context;

  return (
    <section className="qvh-cl-week-hero" aria-label="Semana de Champions League">
      <div className="qvh-cl-week-hero-bg" aria-hidden>
        <span className="qvh-cl-week-hero-rays" />
        <span className="qvh-cl-week-hero-glow" />
      </div>

      <div className="qvh-cl-week-hero-inner">
        <div className="qvh-cl-week-hero-brand">
          <div className="qvh-cl-week-emblem" aria-hidden>
            <Image
              src="/champions/ucl-trophy.svg"
              alt=""
              width={56}
              height={74}
              className="qvh-cl-week-trophy"
              priority
            />
          </div>
          <div className="qvh-cl-week-hero-copy">
            <p className="qvh-cl-week-kicker">{kicker}</p>
            <h2 className="qvh-cl-week-headline">{headline}</h2>
            <p className="qvh-cl-week-stage">
              <span className="qvh-cl-week-stage-badge">{stageLabel}</span>
            </p>
          </div>
        </div>

        <div className="qvh-cl-week-matchup">
          <div className="qvh-cl-week-team">
            <span className="qvh-cl-week-team-name">{homeTeam}</span>
          </div>
          <span className="qvh-cl-week-vs">VS</span>
          <div className="qvh-cl-week-team qvh-cl-week-team-away">
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
    </section>
  );
}
