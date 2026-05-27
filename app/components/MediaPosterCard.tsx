"use client";

import { memo, useMemo, useState } from "react";
import { RemotePoster } from "./RemotePoster";
import { buildEventDetails } from "../lib/event-details";
import { eventDisplayTime } from "../lib/madrid-time";
import { formatDisplayDateLabel, MADRID_TZ } from "../lib/timezone";
import {
  mediaBadgeForEvent,
  resolveEventStreamingPlatform,
} from "../lib/media-platform";
import { isSeasonPremiereEvent } from "../lib/tmdb-client";
import { resolveEventPosterUrl } from "../lib/event-poster";
import { displaySeriesSubtitle, displaySeriesTitle } from "../lib/series-display";
import { getEventCardStamp } from "../lib/event-card-stamp";
import type { EventRow } from "./types";
import { EventCardStamp } from "./EventCardStamp";

type Props = {
  event: EventRow;
  index?: number;
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
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const sport =
    event.sport === "cine" ? "cine" : event.sport === "tv" ? "tv" : "series";
  const title =
    sport === "series"
      ? displaySeriesTitle(event)
      : event.title?.trim() || "Sin título";
  const posterUrl = resolveEventPosterUrl(event, "poster");
  const platform = resolveEventStreamingPlatform(event);
  const subtitle =
    sport === "series"
      ? displaySeriesSubtitle(event)
      : event.competition?.trim() || null;
  const dateLabel = event.date
    ? formatDisplayDateLabel(event.date, MADRID_TZ)
    : "";
  const time = eventDisplayTime(event);
  const badge =
    sport === "cine"
      ? { label: "Cine", tone: "heat" as const }
      : mediaBadgeForEvent(event, isSeasonPremiereEvent(event));
  const whenLabel = [dateLabel, time].filter(Boolean).join(" · ");
  const stamp = getEventCardStamp(event);

  const typeBadge = (
    <span
      className={`qvh-media-type-badge qvh-media-type-badge-${
        badge.label === "Concurso"
          ? "concurso"
          : badge.label === "Directo"
            ? "directo"
            : badge.tone
      }`}
    >
      {badge.label}
    </span>
  );

  const platformPill = platform ? (
    <div className="qvh-media-platform-pill">
      <span
        className={`qvh-media-platform-icon qvh-media-platform-icon-${platform.accent}`}
      >
        {platform.initials}
      </span>
      <span className="qvh-media-platform-name">{platform.name}</span>
    </div>
  ) : (
    <span />
  );

  return (
    <div
      className={`qvh-media-card-col${expanded ? " qvh-media-card-col-expanded" : ""}`}
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
          className={`qvh-media-card-poster${stamp ? " qvh-media-card-poster-stamped" : ""}`}
        >
          {stamp ? <EventCardStamp kind={stamp} size="compact" /> : null}
          {posterUrl ? (
            <RemotePoster
              src={posterUrl}
              className="qvh-media-card-image qvh-remote-poster"
            />
          ) : (
            <div className="qvh-media-card-fallback" aria-hidden />
          )}
          <div className="qvh-media-card-overlay" aria-hidden />

          <div className="qvh-media-card-top">
            {sport === "cine" ? (
              <>
                {typeBadge}
                {platformPill}
              </>
            ) : (
              <>
                {platformPill}
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
