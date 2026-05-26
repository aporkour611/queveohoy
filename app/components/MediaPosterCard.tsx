"use client";

import { memo, useMemo, useState } from "react";
import { buildEventDetails } from "../lib/event-details";
import { parseChannels } from "../lib/channels";
import { displayTime } from "../lib/madrid-time";
import { formatDisplayDateLabel } from "../lib/timezone";
import { useTimezone } from "../lib/timezone-context";
import {
  mediaBadgeForEvent,
  resolveMediaPlatform,
} from "../lib/media-platform";
import {
  isSeasonPremiereEvent,
  parseTmdbEpisodeMeta,
  parseTmdbPoster,
} from "../lib/tmdb";
import type { EventRow } from "./types";

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
  const { timeZone } = useTimezone();
  const sport = event.sport === "cine" ? "cine" : "series";
  const title = event.title?.trim() || "Sin título";
  const posterUrl = parseTmdbPoster(event.source);
  const channels = parseChannels(event.platform);
  const platform = resolveMediaPlatform(channels[0]);
  const episodeMeta =
    sport === "series" ? parseTmdbEpisodeMeta(event.external_id) : null;
  const subtitle =
    event.competition?.trim() ||
    (episodeMeta ? `T${episodeMeta.season} · E${episodeMeta.episode}` : "");
  const dateLabel = event.date ? formatDisplayDateLabel(event.date, timeZone) : "";
  const time = displayTime(event.time);
  const badge = mediaBadgeForEvent(sport, isSeasonPremiereEvent(event));
  const whenLabel = [dateLabel, time].filter(Boolean).join(" · ");

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
        <div className="qvh-media-card-poster">
          {posterUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={posterUrl} alt="" className="qvh-media-card-image" loading="lazy" />
          ) : (
            <div className="qvh-media-card-fallback" aria-hidden />
          )}
          <div className="qvh-media-card-overlay" aria-hidden />

          <div className="qvh-media-card-top">
            {platform ? (
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
            )}
            <span className={`qvh-media-type-badge qvh-media-type-badge-${badge.tone}`}>
              {badge.label}
            </span>
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
