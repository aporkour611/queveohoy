"use client";

import { memo, useMemo, useState } from "react";
import { RemotePoster } from "./RemotePoster";
import { buildEventDetails } from "../lib/event-details";
import { eventDisplayTime } from "../lib/madrid-time";
import { formatDisplayDateLabel, MADRID_TZ } from "../lib/timezone";
import { ChannelBadges } from "./ChannelBadge";
import {
  mediaBadgeForEvent,
  resolveEventChannelList,
} from "../lib/media-platform";
import { isSeasonPremiereEvent } from "../lib/tmdb-client";
import { resolveEventPosterObjectPosition, resolveEventPosterUrl } from "../lib/event-poster";
import { displaySeriesSubtitle, displaySeriesTitle } from "../lib/series-display";
import { isTvFictionSeriesEvent } from "../lib/tv-show-category";
import { getEventCardStamp } from "../lib/event-card-stamp";
import type { EventRow } from "./types";
import { EventCardStamp } from "./EventCardStamp";

type Props = {
  event: EventRow;
  index?: number;
  compact?: boolean;
  /** Tarjetas de cine: algo más grandes que series/anime, pero más compactas que antes. */
  cine?: boolean;
  /** Misma altura que Destacados (132px) para series tipo Euphoria. */
  spotlightAspect?: boolean;
};

function MediaDetailsPanel({ event }: { event: EventRow }) {
  const details = useMemo(() => buildEventDetails(event), [event]);

  return (
    <div className="qvh-media-card-details" onClick={(e) => e.stopPropagation()}>
      {details.map(({ label, value }) => (
        <div key={label} className="qvh-media-detail-row">
          <span className="qvh-media-detail-label">{label}</span>
          <span className="qvh-media-detail-value">{value}</span>
        </div>
      ))}
    </div>
  );
}

export const MediaPosterCard = memo(function MediaPosterCard({
  event,
  index = 0,
  compact = false,
  cine = false,
  spotlightAspect = false,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const isLinearSeries = isTvFictionSeriesEvent(event);
  const sport =
    event.sport === "cine"
      ? "cine"
      : event.sport === "series" || isLinearSeries
        ? "series"
        : event.sport === "anime"
          ? "anime"
          : event.sport === "tv"
            ? "tv"
            : "series";
  const title =
    sport === "series"
      ? displaySeriesTitle(event)
      : event.title?.trim() || "Sin título";
  const isAnimeCard = sport === "anime";
  const posterUrl = resolveEventPosterUrl(event, "poster");
  const posterObjectPosition = resolveEventPosterObjectPosition(event);
  const channels = resolveEventChannelList(event);
  const subtitle =
    sport === "series"
      ? displaySeriesSubtitle(event)
      : isAnimeCard
        ? event.competition?.trim() || "Anime"
        : event.competition?.trim() || null;
  const dateLabel = event.date
    ? formatDisplayDateLabel(event.date, MADRID_TZ)
    : "";
  const time = eventDisplayTime(event);
  const badge =
    sport === "cine"
      ? { label: "Cine", tone: "heat" as const }
      : isAnimeCard
        ? { label: "Anime", tone: "trending" as const }
        : mediaBadgeForEvent(event, isSeasonPremiereEvent(event));
  const whenLabel = [dateLabel, time].filter(Boolean).join(" · ");
  const stamp = getEventCardStamp(event);

  const typeBadge = (
    <span
      className={`qvh-media-type-badge qvh-media-type-badge-${
        badge.label === "Concurso"
          ? "concurso"
          : badge.label === "TV"
            ? "directo"
            : badge.label === "Anime"
              ? "anime"
              : badge.tone
      }`}
    >
      {badge.label}
    </span>
  );

  const platformBadges = channels.length ? (
    <ChannelBadges channels={channels} variant="inline" />
  ) : null;

  return (
    <div
      className={`qvh-media-card-col${expanded ? " qvh-media-card-col-expanded" : ""}${
        compact ? " qvh-media-card-col-compact" : ""
      }${cine ? " qvh-media-card-col-cine" : ""}${
        spotlightAspect ? " qvh-media-card-col-spotlight" : ""
      }`}
    >
      <div
        className={`qvh-media-card qvh-media-card-tilt${expanded ? " qvh-media-card-expanded" : ""}`}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        style={{ animationDelay: `${Math.min(index, 12) * 50}ms` }}
        onClick={() => setExpanded((open) => !open)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setExpanded((open) => !open);
          }
        }}
      >
        <div
          className={`qvh-media-card-poster${
            stamp ? " qvh-media-card-poster-stamped" : ""
          }${spotlightAspect ? " qvh-media-card-poster-spotlight" : ""}`}
        >
          {stamp ? <EventCardStamp kind={stamp} size="compact" /> : null}
          <div className="qvh-media-card-fallback" aria-hidden />
          {posterUrl ? (
            <RemotePoster
              src={posterUrl}
              className="qvh-media-card-image qvh-remote-poster"
              objectPosition={posterObjectPosition}
            />
          ) : null}
          <div className="qvh-media-card-overlay" aria-hidden />

          <div className="qvh-media-card-top">
            {sport === "cine" ? (
              <>
                {typeBadge}
                {platformBadges}
              </>
            ) : (
              <>
                {platformBadges}
                {typeBadge}
              </>
            )}
          </div>

          <div className="qvh-media-card-bottom">
            <p className="qvh-media-card-title">{title}</p>
            {subtitle ? <p className="qvh-media-card-subtitle">{subtitle}</p> : null}
            {whenLabel ? <p className="qvh-media-card-when">{whenLabel}</p> : null}
          </div>
        </div>

        {expanded ? (
          <MediaDetailsPanel event={event} />
        ) : (
          <p className="qvh-media-card-hint">Toca para más info</p>
        )}
      </div>
    </div>
  );
});
