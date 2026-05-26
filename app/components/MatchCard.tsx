"use client";

import { memo, useMemo, useState, type ReactNode } from "react";
import { TeamCrest } from "./TeamCrest";
import { parseEsportsTeamLogos, esportsLogoFallbackUrls } from "../lib/esports";
import { parseFootballTeamIds, shortTeamName, teamCrestUrl } from "../lib/football";
import { buildEventDetails } from "../lib/event-details";
import { parseTmdbPoster } from "../lib/tmdb";
import { parseUfcImage } from "../lib/thesportsdb-ufc";
import { parseChannels, isFreeTvChannel } from "../lib/channels";
import { openWatchUrl, resolveWatchUrl } from "../lib/watch-links";
import { competitionMatchClass } from "../lib/competition-style";
import { displayTime } from "../lib/madrid-time";
import type { EventRow } from "./types";

type Props = {
  event: EventRow;
};

function EventDetailsPanel({ event }: { event: EventRow }) {
  const details = useMemo(() => buildEventDetails(event), [event]);

  if (!details.length) return null;

  return (
    <div className="fh-m-details" onClick={(e) => e.stopPropagation()}>
      {details.map(({ label, value }) => (
        <div key={label} className="fh-m-detail-row">
          <span className="fh-m-detail-label">{label}</span>
          <span className="fh-m-detail-value">{value}</span>
        </div>
      ))}
    </div>
  );
}

export const MatchCard = memo(function MatchCard({ event }: Props) {
  const [expanded, setExpanded] = useState(false);
  const watchLink = useMemo(() => resolveWatchUrl(event), [event]);
  const hasDetails = useMemo(() => buildEventDetails(event).length > 0, [event]);
  const isMedia = event.sport === "cine" || event.sport === "series";
  const isUfc = event.sport === "ufc";
  const mediaTitle = event.title?.trim() || "Sin título";
  const posterUrl = isUfc
    ? parseUfcImage(event.source)
    : parseTmdbPoster(event.source);

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

  function toggleExpanded() {
    setExpanded((open) => !open);
  }

  function handleCardClick() {
    if (watchLink) {
      openWatchUrl(watchLink);
      return;
    }
    toggleExpanded();
  }

  const cardShell = (children: ReactNode) => (
    <div className={`fh-cardcol${expanded ? " fh-cardcol-expanded" : ""}`}>
      <div
        className={`fh-match ${matchClass}${expanded ? " fh-match-expanded" : ""}${watchLink ? " fh-match-watchable" : ""}`}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        aria-label={
          watchLink
            ? `Ver en ${watchLink.label}: ${event.title ?? "evento"}`
            : undefined
        }
        onClick={handleCardClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleCardClick();
          }
        }}
      >
        {children}
        {watchLink && hasDetails ? (
          <button
            type="button"
            className="fh-m-details-btn"
            aria-expanded={expanded}
            aria-label="Ver detalles del evento"
            onClick={(e) => {
              e.stopPropagation();
              toggleExpanded();
            }}
          >
            Detalles
          </button>
        ) : null}
        {expanded ? (
          <EventDetailsPanel event={event} />
        ) : watchLink ? (
          <p className="fh-m-expand-hint">Toca para ver en {watchLink.label}</p>
        ) : hasDetails ? (
          <p className="fh-m-expand-hint">Toca para más info</p>
        ) : null}
      </div>
    </div>
  );

  if (isMedia || isUfc) {
    return cardShell(
      <>
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
      </>
    );
  }

  return cardShell(
    <>
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
    </>
  );
});
