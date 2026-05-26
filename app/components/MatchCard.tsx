"use client";

import { TeamCrest } from "./TeamCrest";
import { parseEsportsTeamLogos, esportsLogoFallbackUrls } from "../lib/esports";
import { parseFootballTeamIds, shortTeamName, teamCrestUrl } from "../lib/football";
import { parseTmdbPoster } from "../lib/tmdb";
import { parseChannels, isFreeTvChannel } from "../lib/channels";
import { competitionMatchClass } from "../lib/competition-style";
import { displayTime } from "../lib/madrid-time";
import type { EventRow } from "./types";

type Props = {
  event: EventRow;
};

export function MatchCard({ event }: Props) {
  const isMedia = event.sport === "cine" || event.sport === "series";
  const mediaTitle = event.title?.trim() || "Sin título";
  const posterUrl = parseTmdbPoster(event.source);

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

  const homeCrestUrls = esportsLogos?.homeUrl
    ? esportsLogoFallbackUrls(esportsLogos.homeUrl)
    : homeCrest
      ? [homeCrest]
      : [];
  const awayCrestUrls = esportsLogos?.awayUrl
    ? esportsLogoFallbackUrls(esportsLogos.awayUrl)
    : awayCrest
      ? [awayCrest]
      : [];

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

  if (isMedia) {
    return (
      <div className="fh-cardcol">
        <div className={`fh-match ${matchClass}`}>
          <div className="fh-m-comp" />

          <div className="fh-m-title fh-m-title-media">
            <span className="fh-dest-team">{mediaTitle}</span>
          </div>

          <div className="fh-m-logos fh-m-logos-media">
            <TeamCrest
              srcList={posterUrl ? [posterUrl] : []}
              name={mediaTitle}
              size={50}
              className="fh-crest-fallback"
            />
            <span className="fh-m-time">{time}</span>
            <div className="fh-media-spacer" aria-hidden />
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

  return (
    <div className="fh-cardcol">
      <div className={`fh-match ${matchClass}`}>
        <div className="fh-m-comp" />

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
          <TeamCrest
            srcList={homeCrestUrls}
            name={home}
            size={50}
            className="fh-crest-fallback"
          />
          <span className="fh-m-time">{time}</span>
          <TeamCrest
            srcList={awayCrestUrls}
            name={away}
            size={50}
            className="fh-crest-fallback"
          />
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
