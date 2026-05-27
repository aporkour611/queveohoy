"use client";

import { memo, useMemo, useState, type ReactNode } from "react";
import { TeamCrest } from "./TeamCrest";
import { parseEsportsTeamLogos, esportsLogoFallbackUrls } from "../lib/esports";
import { parseFootballTeamIds, shortTeamName, teamCrestUrl } from "../lib/football";
import { buildEventDetails } from "../lib/event-details";
import { parseTmdbPoster } from "../lib/tmdb-client";
import { curatedMovieByExternalId } from "../lib/movies-curated";
import { encodeTmdbSource } from "../lib/tmdb";
import { resolveEventStreamingPlatform } from "../lib/media-platform";
import { displaySeriesSubtitle, displaySeriesTitle } from "../lib/series-display";
import {
  parseUfcFighterImages,
  parseUfcImage,
  parseUfcKindFromSource,
  parseUfcMainEventFighters,
  ufcKindLabel,
} from "../lib/thesportsdb-ufc-client";
import { RemotePoster } from "./RemotePoster";
import { UfcFightVisual } from "./UfcFightVisual";
import { isFreeTvChannel, resolveChannelsForEvent } from "../lib/channels";
import { partidoPath } from "../lib/event-slug";
import {
  eventDisplayTitle,
  eventVersusTeams,
  isTeamVersusEvent,
} from "../lib/event-display";
import Link from "next/link";
import { competitionMatchClass } from "../lib/competition-style";
import { eventDisplayTime } from "../lib/madrid-time";
import { getEventCardStamp, type EventCardStampKind } from "../lib/event-card-stamp";
import { mediaBadgeForEvent } from "../lib/media-platform";
import { formatDisplayDateLabel, MADRID_TZ } from "../lib/timezone";
import type { EventRow } from "./types";
import { EventCardStamp } from "./EventCardStamp";

type Props = {
  event: EventRow;
};

type SpotlightCardContent = {
  visualClass: string;
  badgeClass: string;
  badgeLabel: string;
  title: string;
  subtitle?: string | null;
  posterUrl?: string | null;
  dateLabel: string;
  time: string;
  channels: string[];
  ufcF1Url?: string | null;
  ufcF2Url?: string | null;
  ufcF1Name?: string | null;
  ufcF2Name?: string | null;
  showUfcDuel?: boolean;
  stampKind?: EventCardStampKind | null;
};

function SpotlightCardContent({
  visualClass,
  badgeClass,
  badgeLabel,
  title,
  subtitle,
  posterUrl,
  dateLabel,
  time,
  channels,
  ufcF1Url,
  ufcF2Url,
  ufcF1Name,
  ufcF2Name,
  showUfcDuel = false,
  stampKind = null,
}: SpotlightCardContent) {
  const ufcDuelActive =
    showUfcDuel || Boolean(ufcF1Url || ufcF2Url || (ufcF1Name && ufcF2Name));

  return (
    <>
      <div
        className={`fh-media-spotlight-visual ${visualClass}${
          ufcDuelActive ? " fh-media-spotlight-visual-ufc-duel" : ""
        }${stampKind ? " fh-media-spotlight-visual-stamped" : ""}`}
      >
        {stampKind ? <EventCardStamp kind={stampKind} size="compact" /> : null}
        {posterUrl && !ufcDuelActive ? (
          <RemotePoster src={posterUrl} className="fh-media-spotlight-banner" />
        ) : null}
        {ufcDuelActive ? (
          <UfcFightVisual
            f1Url={ufcF1Url}
            f2Url={ufcF2Url}
            f1Name={ufcF1Name}
            f2Name={ufcF2Name}
          />
        ) : null}
        <div className="fh-media-spotlight-overlay" aria-hidden />
        <span className={`fh-media-spotlight-badge ${badgeClass}`}>
          {badgeLabel}
        </span>
        <div className="fh-media-spotlight-when">
          {dateLabel ? (
            <span className="fh-media-spotlight-date">{dateLabel}</span>
          ) : null}
          {time ? (
            <span className="fh-media-spotlight-time">{time}</span>
          ) : null}
        </div>
      </div>

      <div className="fh-media-spotlight-body">
        <h4 className="fh-media-spotlight-title">{title}</h4>
        {subtitle ? <p className="fh-media-spotlight-meta">{subtitle}</p> : null}
        {channels.length > 0 && (
          <div className="fh-m-chan fh-m-chan-prominent">
            {channels.map((ch) => (
              <span
                key={ch}
                className={
                  isFreeTvChannel(ch) ? "fh-ch-free" : "fh-ch-paid"
                }
                title={isFreeTvChannel(ch) ? "En abierto" : "De pago"}
              >
                {ch}
              </span>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

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
  const details = useMemo(() => buildEventDetails(event), [event]);
  const hasExtraDetails = details.length > 0;
  const isCine = event.sport === "cine";
  const isSeries = event.sport === "series";
  const isTv = event.sport === "tv";
  const isMedia = isCine || isSeries || isTv;
  const isUfc = event.sport === "ufc";
  const ufcKind = isUfc ? parseUfcKindFromSource(event.source) : null;
  const mediaTitle = isSeries
    ? displaySeriesTitle(event)
    : event.title?.trim() || "Sin título";
  const mediaSubtitle = isSeries
    ? displaySeriesSubtitle(event)
    : isUfc && event.competition?.trim() && event.competition !== ufcKindLabel(ufcKind ?? "other")
      ? event.competition.trim()
      : isUfc
        ? event.platform?.trim() || null
        : event.competition?.trim() || null;
  const posterUrl = isUfc
    ? parseUfcImage(event.source)
    : parseTmdbPoster(event.source, isSeries || isCine || isTv ? "poster" : "thumb") ??
      (isCine
        ? (() => {
            const curated = curatedMovieByExternalId(event.external_id);
            return curated?.posterPath
              ? parseTmdbPoster(encodeTmdbSource(curated.posterPath), "poster")
              : null;
          })()
        : null);

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

  const teams = eventVersusTeams(event);
  const home = teams ? shortTeamName(teams.home) : "";
  const away = teams ? shortTeamName(teams.away) : "";
  const soloTitle = eventDisplayTitle(event);
  const time = eventDisplayTime(event);
  const dateLabel = event.date
    ? formatDisplayDateLabel(event.date, MADRID_TZ)
    : "";
  const mediaPlatform = isMedia ? resolveEventStreamingPlatform(event) : null;
  const channels = mediaPlatform
    ? [mediaPlatform.name]
    : isMedia
      ? []
      : resolveChannelsForEvent(event);
  const compFull = event.competition ?? "";
  const compDisplay = compFull.split(" · ")[0] || compFull;
  const matchClass = competitionMatchClass(compDisplay, event.sport);
  const stamp = getEventCardStamp(event);

  function toggleExpanded() {
    if (!hasExtraDetails) return;
    setExpanded((open) => !open);
  }

  const cardShell = (children: ReactNode, extraClass = "", stampOnCard = false) => (
    <div className={`fh-cardcol${expanded ? " fh-cardcol-expanded" : ""}`}>
      <div
        className={`fh-match ${matchClass}${expanded ? " fh-match-expanded" : ""}${extraClass ? ` ${extraClass}` : ""}${hasExtraDetails ? " fh-match-expandable" : ""}${stampOnCard && stamp ? " fh-match-stamped" : ""}`}
        role={hasExtraDetails ? "button" : undefined}
        tabIndex={hasExtraDetails ? 0 : undefined}
        aria-expanded={hasExtraDetails ? expanded : undefined}
        onClick={hasExtraDetails ? toggleExpanded : undefined}
        onKeyDown={
          hasExtraDetails
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggleExpanded();
                }
              }
            : undefined
        }
      >
        {stampOnCard && stamp ? <EventCardStamp kind={stamp} /> : null}
        {children}
        {expanded && hasExtraDetails ? (
          <EventDetailsPanel event={event} />
        ) : hasExtraDetails ? (
          <p className="fh-m-expand-hint">Toca para más info</p>
        ) : null}
      </div>
    </div>
  );

  if (isMedia) {
    const tvBadge = isTv ? mediaBadgeForEvent(event) : null;
    const mediaVisualClass = isCine
      ? "fh-media-spotlight-visual-cine"
      : isSeries
        ? "fh-media-spotlight-visual-series"
        : "fh-media-spotlight-visual-premiere";
    const mediaBadgeClass = isCine
      ? "fh-media-spotlight-badge-cine"
      : isSeries
        ? "fh-media-spotlight-badge-series"
        : tvBadge?.label === "Concurso"
          ? "fh-media-spotlight-badge-concurso"
          : tvBadge?.label === "Directo"
            ? "fh-media-spotlight-badge-directo"
            : "fh-media-spotlight-badge-premiere";
    const mediaBadgeLabel = isCine
      ? "Cine"
      : isSeries
        ? "Serie"
        : tvBadge?.label ?? "Reality";

    return cardShell(
      <SpotlightCardContent
        visualClass={mediaVisualClass}
        badgeClass={mediaBadgeClass}
        badgeLabel={mediaBadgeLabel}
        title={mediaTitle}
        subtitle={mediaSubtitle}
        posterUrl={posterUrl}
        dateLabel={dateLabel}
        time={time}
        channels={channels}
        stampKind={stamp}
      />,
      "fh-match-media-spotlight"
    );
  }

  if (isUfc) {
    const ufcBadgeLabel =
      mediaTitle.startsWith("UFC") ? mediaTitle : ufcKindLabel(ufcKind ?? "other");
    const { f1, f2 } = parseUfcFighterImages(event.source);
    const matchup = parseUfcMainEventFighters(event.competition, event.title);
    const f1Name = event.home_team || matchup?.n1 || null;
    const f2Name = event.away_team || matchup?.n2 || null;
    const showUfcDuel = Boolean(f1 || f2 || (f1Name && f2Name));

    return cardShell(
      <SpotlightCardContent
        visualClass="fh-media-spotlight-visual-ufc"
        badgeClass="fh-media-spotlight-badge-ufc"
        badgeLabel={ufcBadgeLabel}
        title={mediaTitle}
        subtitle={mediaSubtitle}
        posterUrl={showUfcDuel ? null : posterUrl}
        ufcF1Url={f1}
        ufcF2Url={f2}
        ufcF1Name={f1Name}
        ufcF2Name={f2Name}
        showUfcDuel={showUfcDuel}
        dateLabel={dateLabel}
        time={time}
        channels={channels}
        stampKind={stamp}
      />,
      "fh-match-media-spotlight"
    );
  }

  return cardShell(
    <>
        <div className="fh-m-comp">{compDisplay}</div>

        {isTeamVersusEvent(event) ? (
          <>
            <div className="fh-m-title">
              <Link
                href={partidoPath(event)}
                className="fh-m-title-link"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="fh-dest-team">{home}</span>
                {" - "}
                <span className="fh-dest-team">{away}</span>
              </Link>
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
          </>
        ) : (
          <>
            <div className="fh-m-title">
              <Link
                href={partidoPath(event)}
                className="fh-m-title-link fh-m-title-solo"
                onClick={(e) => e.stopPropagation()}
              >
                {soloTitle}
              </Link>
            </div>

            <div className="fh-m-solo-when">
              <span className="fh-m-time fh-m-time-solo">{time}</span>
            </div>
          </>
        )}

      {channels.length > 0 && (
        <div className="fh-m-chan fh-m-chan-prominent">
          {channels.map((ch) => (
            <span
              key={ch}
              className={isFreeTvChannel(ch) ? "fh-ch-free" : "fh-ch-paid"}
              title={isFreeTvChannel(ch) ? "En abierto" : "De pago"}
            >
              {ch}
            </span>
          ))}
        </div>
      )}
    </>,
    "",
    true
  );
});
