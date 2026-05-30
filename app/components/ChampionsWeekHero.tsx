import Image from "next/image";
import type { ChampionsWeekContext } from "../lib/champions-week";
import { ChannelBadges } from "./ChannelBadge";
import { EventCountdown } from "./EventCountdown";
import { TeamCrest } from "./TeamCrest";

type Props = {
  context: ChampionsWeekContext;
};

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
    eventDate,
    eventTime,
    channels,
  } = context;

  return (
    <section className="qvh-cl-week-hero" aria-label="Semana de Champions League">
      <div className="qvh-cl-week-hero-bg" aria-hidden>
        <span className="qvh-cl-week-hero-glow" />
      </div>

      <div className="qvh-cl-week-hero-inner">
        <div className="qvh-cl-week-emblem" aria-hidden>
          <Image
            src="/champions/ucl-trophy.svg"
            alt=""
            width={28}
            height={37}
            className="qvh-cl-week-trophy"
            priority
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
                <TeamCrest
                  src={homeCrest}
                  name={homeTeam}
                  size={36}
                  className="qvh-cl-week-crest"
                  eager
                />
                <span className="qvh-cl-week-team-name">{homeTeam}</span>
              </div>
              <span className="qvh-cl-week-vs">VS</span>
              <div className="qvh-cl-week-team">
                <TeamCrest
                  src={awayCrest}
                  name={awayTeam}
                  size={36}
                  className="qvh-cl-week-crest"
                  eager
                />
                <span className="qvh-cl-week-team-name">{awayTeam}</span>
              </div>
            </div>

            <div className="qvh-cl-week-meta">
              <EventCountdown
                date={eventDate}
                time={eventTime}
                className="qvh-cl-week-countdown"
                liveLabel="¡Arranca la final!"
              />
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
    </section>
  );
}
