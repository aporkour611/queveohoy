"use client";

import { TeamCrest } from "./TeamCrest";
import { parseEsportsTeamLogos } from "../lib/esports";
import { parseFootballTeamIds, shortTeamName, teamCrestUrl } from "../lib/football";
import { parseChannels, isFreeTvChannel } from "../lib/channels";
import { competitionMatchClass } from "../lib/competition-style";
import { displayTime } from "../lib/madrid-time";
import type { EventRow } from "./types";

type Props = {
  event: EventRow;
  upcomingBadge?: string | null;
};

export function MatchCard({ event, upcomingBadge }: Props) {
  const esportsLogos = parseEsportsTeamLogos(event.source);
  const footballIds =
    event.sport === "futbol"
      ? parseFootballTeamIds(
          event.external_id,
          event.source,
          event.home_team,
          event.away_team
        )
      : null;

  const homeCrest =
    esportsLogos?.homeUrl ??
    (footballIds ? teamCrestUrl(footballIds.homeId) : null);
  const awayCrest =
    esportsLogos?.awayUrl ??
    (footballIds ? teamCrestUrl(footballIds.awayId) : null);

  const home = shortTeamName(event.home_team || event.title?.split(" vs ")[0]);
  const away = shortTeamName(
    event.away_team || event.title?.split(" vs ").slice(1).join(" vs ")
  );
  const time = displayTime(event.time);
  const channels = parseChannels(event.platform);
  const compFull = event.competition ?? "";
  const isFinal = compFull.includes("· Final");
  const compDisplay = compFull.split(" · ")[0] || compFull;
  const matchClass = competitionMatchClass(compDisplay, event.sport);

  return (
    <div className="fh-cardcol">
      <div className={`fh-match ${matchClass}`}>
        <div className="fh-m-comp" />

        {upcomingBadge && (
          <div className="fh-m-upcoming">
            <span>{upcomingBadge}</span>
          </div>
        )}

        {isFinal && (
          <div className="fh-m-phase">
            <span>Final</span>
          </div>
        )}

        <div className="fh-m-title">
          <span className="fh-dest-team">{home}</span>
          {" - "}
          <span className="fh-dest-team">{away}</span>
        </div>

        <div className="fh-m-logos">
          <TeamCrest src={homeCrest} name={home} size={50} className="fh-crest-fallback" />
          <span className="fh-m-time">{time}</span>
          <TeamCrest src={awayCrest} name={away} size={50} className="fh-crest-fallback" />
        </div>

        {channels.length > 0 && (
          <div className="fh-m-chan">
            {channels.map((ch) => (
              <span
                key={ch}
                className={isFreeTvChannel(ch) ? "fh-ch-free" : "fh-ch-paid"}
              >
                {ch}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
