import type { ChampionsWeekContext } from "../lib/champions-week";
import { ChannelBadges } from "./ChannelBadge";

type Props = {
  context: ChampionsWeekContext;
};

function ChampionsStarball({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 120"
      fill="none"
      aria-hidden
    >
      <circle cx="60" cy="60" r="54" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
      <circle cx="60" cy="60" r="38" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
      <circle cx="60" cy="60" r="22" stroke="rgba(201,162,39,0.35)" strokeWidth="1.5" />
      {Array.from({ length: 8 }).map((_, index) => {
        const angle = (index * Math.PI) / 4;
        const x1 = 60 + Math.cos(angle) * 18;
        const y1 = 60 + Math.sin(angle) * 18;
        const x2 = 60 + Math.cos(angle) * 52;
        const y2 = 60 + Math.sin(angle) * 52;
        return (
          <line
            key={index}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1"
          />
        );
      })}
      <polygon
        points="60,18 63,28 74,28 65,35 68,46 60,39 52,46 55,35 46,28 57,28"
        fill="rgba(201,162,39,0.85)"
      />
    </svg>
  );
}

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
          <ChampionsStarball className="qvh-cl-week-starball" />
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
