"use client";

import "../futbolhoy-feed.css";
import "../media.css";
import { memo, startTransition, useMemo, useState, type ReactNode } from "react";
import { TeamCrest } from "./TeamCrest";
import { parseEsportsTeamLogos, esportsLogoFallbackUrls, isEsportsSport } from "../lib/esports";
import { parseFootballTeamIds, shortTeamName, teamCrestUrl } from "../lib/football";
import { buildEventDetails } from "../lib/event-details";
import { matchCardEntertainmentVisualClass } from "../lib/entertainment-art";
import { resolveEventPosterObjectPosition, resolveEventPosterUrl } from "../lib/event-poster";
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
import { ChannelBadges } from "./ChannelBadge";
import { resolveChannelsForEvent } from "../lib/channels";
import { partidoPath } from "../lib/event-slug";
import {
  eventDisplayTitle,
  eventVersusTeams,
  isTeamVersusEvent,
} from "../lib/event-display";
import { competitionMatchClass } from "../lib/competition-style";
import { getSpotlightCardModel } from "../lib/featured-card";
import { eventDisplayTime } from "../lib/madrid-time";
import { getEventCardStamp, type EventCardStampKind } from "../lib/event-card-stamp";
import { mediaBadgeForEvent } from "../lib/media-platform";
import { formatDisplayDateLabel, MADRID_TZ } from "../lib/timezone";
import Link from "next/link";
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
  posterObjectPosition?: string;
  dateLabel: string;
  time: string;
  channels: string[];
  ufcF1Url?: string | null;
  ufcF2Url?: string | null;
  ufcF1Name?: string | null;
  ufcF2Name?: string | null;
  showUfcDuel?: boolean;
  showTeamDuel?: boolean;
  homeCrest?: string | null;
  awayCrest?: string | null;
  homeCrestUrls?: string[];
  awayCrestUrls?: string[];
  homeName?: string | null;
  awayName?: string | null;
  gameArtUrl?: string | null;
  stampKind?: EventCardStampKind | null;
};

function SpotlightCardContent({
  visualClass,
  badgeClass,
  badgeLabel,
  title,
  subtitle,
  posterUrl,
  posterObjectPosition,
  dateLabel,
  time,
  channels,
  ufcF1Url,
  ufcF2Url,
  ufcF1Name,
  ufcF2Name,
  showUfcDuel = false,
  showTeamDuel = false,
  homeCrest,
  awayCrest,
  homeCrestUrls = [],
  awayCrestUrls = [],
  homeName,
  awayName,
  gameArtUrl,
  stampKind = null,
}: SpotlightCardContent) {
  const ufcDuelActive =
    showUfcDuel || Boolean(ufcF1Url || ufcF2Url || (ufcF1Name && ufcF2Name));
  const teamDuelActive =
    showTeamDuel || Boolean(homeCrest || awayCrest || (homeName && awayName));

  return (
    <>
      <div
        className={`fh-media-spotlight-visual ${visualClass}${
          ufcDuelActive ? " fh-media-spotlight-visual-ufc-duel" : ""
        }${teamDuelActive ? " fh-media-spotlight-visual-team-duel" : ""}${
          stampKind ? " fh-media-spotlight-visual-stamped" : ""
        }`}
      >
        {stampKind ? <EventCardStamp kind={stampKind} size="compact" /> : null}
        {gameArtUrl && !posterUrl && !ufcDuelActive ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={gameArtUrl}
            alt=""
            className="fh-media-spotlight-banner fh-media-spotlight-game-art"
          />
        ) : null}
        {posterUrl && !ufcDuelActive && !teamDuelActive ? (
          <RemotePoster
            src={posterUrl}
            className="fh-media-spotlight-banner"
            objectPosition={posterObjectPosition}
          />
        ) : null}
        {ufcDuelActive ? (
          <UfcFightVisual
            f1Url={ufcF1Url}
            f2Url={ufcF2Url}
            f1Name={ufcF1Name}
            f2Name={ufcF2Name}
          />
        ) : null}
        {teamDuelActive && !ufcDuelActive ? (
          <div className="fh-media-spotlight-duel" aria-hidden>
            <div className="fh-media-spotlight-duel-team">
              <TeamCrest
                srcList={homeCrestUrls.length ? homeCrestUrls : homeCrest ? [homeCrest] : []}
                name={homeName ?? ""}
                size={44}
                className="fh-media-spotlight-crest"
              />
              <span className="fh-media-spotlight-duel-name">{homeName}</span>
            </div>
            <span className="fh-media-spotlight-duel-vs">vs</span>
            <div className="fh-media-spotlight-duel-team">
              <TeamCrest
                srcList={awayCrestUrls.length ? awayCrestUrls : awayCrest ? [awayCrest] : []}
                name={awayName ?? ""}
                size={44}
                className="fh-media-spotlight-crest"
              />
              <span className="fh-media-spotlight-duel-name">{awayName}</span>
            </div>
          </div>
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
        {channels.length > 0 ? (
          <ChannelBadges channels={channels} prominent />
        ) : null}
      </div>
    </>
  );
}

function EventDetailsPanel({ event }: { event: EventRow }) {
  const details = useMemo(() => buildEventDetails(event), [event]);
  const watchChannels = useMemo(() => resolveChannelsForEvent(event), [event]);

  if (!details.length) return null;

  return (
    <div className="fh-m-details" onClick={(e) => e.stopPropagation()}>
      {details.map(({ label, value }) => (
        <div key={label} className="fh-m-detail-row">
          <span className="fh-m-detail-label">{label}</span>
          {label === "Dónde ver" && watchChannels.length > 0 ? (
            <span className="fh-m-detail-value">
              <ChannelBadges channels={watchChannels} variant="inline" />
            </span>
          ) : (
            <span className="fh-m-detail-value">{value}</span>
          )}
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
  const isAnime = event.sport === "anime";
  const isTv = event.sport === "tv";
  const isMedia = isCine || isSeries || isAnime || isTv;
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
    : resolveEventPosterUrl(
        event,
        isSeries || isCine || isAnime || isTv ? "poster" : "thumb"
      );

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
    startTransition(() => setExpanded((open) => !open));
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
    const mediaSport = isCine
      ? "cine"
      : isSeries
        ? "series"
        : isAnime
          ? "anime"
          : "tv";
    const mediaVisualClass = matchCardEntertainmentVisualClass(
      mediaSport,
      Boolean(posterUrl)
    );
    const mediaBadgeClass = isCine
      ? "fh-media-spotlight-badge-cine"
      : isSeries
        ? "fh-media-spotlight-badge-series"
        : tvBadge?.label === "Concurso"
          ? "fh-media-spotlight-badge-concurso"
          : tvBadge?.label === "Directo"
            ? "fh-media-spotlight-badge-directo"
            : isAnime
              ? "fh-media-spotlight-badge-anime"
              : "fh-media-spotlight-badge-premiere";
    const mediaBadgeLabel = isCine
      ? "Cine"
      : isAnime
        ? "Anime"
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
        posterObjectPosition={resolveEventPosterObjectPosition(event)}
        dateLabel={dateLabel}
        time={time}
        channels={channels}
        stampKind={stamp}
      />,
      "fh-match-media-spotlight"
    );
  }

  if (isEsportsSport(event.sport)) {
    const card = getSpotlightCardModel(event, MADRID_TZ);
    const visualClass = (card.visualClass ?? "").replace(
      "qvh-spotlight-visual-",
      "fh-media-spotlight-visual-"
    );
    const esportsShellClass =
      event.sport === "valorant"
        ? "fh-match_valorant"
        : event.sport === "lol"
          ? "fh-match_lol"
          : "fh-match_cs2";

    return cardShell(
      <SpotlightCardContent
        visualClass={visualClass}
        badgeClass="fh-media-spotlight-badge-esports"
        badgeLabel={card.badge}
        title={card.headline}
        subtitle={card.meta}
        gameArtUrl={card.coverImage?.local ? card.coverImage.url : null}
        dateLabel={card.dateLabel}
        time={card.time}
        channels={card.channelList ?? (card.platform ? [card.platform] : [])}
        showTeamDuel={card.showTeamDuel}
        homeCrest={card.homeCrest}
        awayCrest={card.awayCrest}
        homeCrestUrls={card.homeCrestList}
        awayCrestUrls={card.awayCrestList}
        homeName={card.homeName}
        awayName={card.awayName}
        stampKind={stamp}
      />,
      `fh-match-media-spotlight ${esportsShellClass}`
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

      {channels.length > 0 ? (
        <ChannelBadges channels={channels} prominent />
      ) : null}
    </>,
    "",
    true
  );
});
