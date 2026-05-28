"use client";

import { memo, useState } from "react";
import type { EventRow } from "./types";
import { RemotePoster } from "./RemotePoster";
import { ChannelBadges } from "./ChannelBadge";
import { eventDisplayTime } from "../lib/madrid-time";
import { resolveEventPosterObjectPosition, resolveEventPosterUrl } from "../lib/event-poster";
import {
  getTvShowCategory,
  tvCategoryLabel,
  type TvShowCategory,
} from "../lib/tv-show-category";
import { resolveEventChannelList } from "../lib/media-platform";

type Props = {
  event: EventRow;
  index?: number;
};

function categoryClass(category: TvShowCategory): string {
  if (category === "directo") return "qvh-tv-cat-directo";
  if (category === "concurso") return "qvh-tv-cat-concurso";
  return "qvh-tv-cat-reality";
}

function fallbackClass(category: TvShowCategory): string {
  if (category === "directo") return "qvh-tv-slot-fallback-directo";
  if (category === "concurso") return "qvh-tv-slot-fallback-concurso";
  return "qvh-tv-slot-fallback-reality";
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
  const channels = resolveEventChannelList(event);
  const [posterFailed, setPosterFailed] = useState(false);
  const showPoster = Boolean(posterUrl) && !posterFailed;
  const metaParts = [time].filter(Boolean);

  return (
    <article
      className="qvh-tv-slot"
      style={{ animationDelay: `${Math.min(index, 10) * 40}ms` }}
    >
      <div className="qvh-tv-slot-media">
        <div
          className={`qvh-tv-slot-fallback ${fallbackClass(category)}`}
          aria-hidden
        />
        {showPoster ? (
          <RemotePoster
            src={posterUrl!}
            className="qvh-tv-slot-poster qvh-remote-poster"
            objectPosition={posterObjectPosition}
            sizeVariant="card"
            onFailed={() => setPosterFailed(true)}
          />
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
