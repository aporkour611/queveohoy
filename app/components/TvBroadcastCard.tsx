"use client";

import { memo } from "react";
import type { EventRow } from "./types";
import { RemotePoster } from "./RemotePoster";
import { ChannelBadges } from "./ChannelBadge";
import { resolveChannelsForEvent } from "../lib/channels";
import { eventDisplayTime } from "../lib/madrid-time";
import { resolveEventPosterObjectPosition, resolveEventPosterUrl } from "../lib/event-poster";
import {
  getTvShowCategory,
  tvCategoryLabel,
  type TvShowCategory,
} from "../lib/tv-show-category";
import { resolveEventStreamingPlatform } from "../lib/media-platform";

type Props = {
  event: EventRow;
  index?: number;
};

function categoryClass(category: TvShowCategory): string {
  if (category === "directo") return "qvh-tv-cat-directo";
  if (category === "concurso") return "qvh-tv-cat-concurso";
  return "qvh-tv-cat-reality";
}

export const TvBroadcastCard = memo(function TvBroadcastCard({
  event,
  index = 0,
}: Props) {
  const category = getTvShowCategory(event) ?? "reality";
  const title = event.title?.trim() || "Programa de TV";
  const time = eventDisplayTime(event);
  const posterUrl = resolveEventPosterUrl(event, "poster");
  const posterObjectPosition = resolveEventPosterObjectPosition(event);
  const platform = resolveEventStreamingPlatform(event);
  const channels = resolveChannelsForEvent(event);
  const metaParts = [
    time,
    platform?.name ?? event.platform?.trim(),
  ].filter(Boolean);

  return (
    <article
      className="qvh-tv-slot"
      style={{ animationDelay: `${Math.min(index, 10) * 40}ms` }}
    >
      <div className="qvh-tv-slot-media">
        {posterUrl ? (
          <RemotePoster
            src={posterUrl}
            className="qvh-tv-slot-poster qvh-remote-poster"
            objectPosition={posterObjectPosition}
            sizeVariant="card"
          />
        ) : (
          <div className="qvh-tv-slot-fallback" aria-hidden />
        )}
        {category === "directo" ? (
          <span className="qvh-tv-live-badge">
            <span className="qvh-tv-live-dot" aria-hidden />
            Directo
          </span>
        ) : null}
      </div>

      <div className="qvh-tv-slot-body">
        <span className={`qvh-tv-cat ${categoryClass(category)}`}>
          {tvCategoryLabel(category)}
        </span>
        <h4 className="qvh-tv-slot-title">{title}</h4>
        {metaParts.length ? (
          <p className="qvh-tv-slot-meta">{metaParts.join(" · ")}</p>
        ) : null}
        {channels.length ? (
          <ChannelBadges channels={channels} variant="inline" />
        ) : null}
      </div>
    </article>
  );
});
