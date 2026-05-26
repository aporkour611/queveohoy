"use client";

import type { EventRow } from "./types";
import { MediaPosterCard } from "./MediaPosterCard";

type Props = {
  cine: EventRow[];
  series: EventRow[];
};

function MediaRail({
  kicker,
  title,
  events,
}: {
  kicker: string;
  title: string;
  events: EventRow[];
}) {
  if (events.length === 0) return null;

  return (
    <div className="qvh-media-rail-block">
      <div className="qvh-media-rail-head">
        <p className="qvh-media-rail-kicker">{kicker}</p>
        <h4 className="qvh-media-rail-title">{title}</h4>
      </div>
      <div className="qvh-media-rail-scroll">
        <div className="qvh-media-rail-track">
          {events.map((event, index) => (
            <MediaPosterCard key={event.id} event={event} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function MediaEntertainmentSection({ cine, series }: Props) {
  if (cine.length === 0 && series.length === 0) return null;

  return (
    <section className="qvh-media-section" aria-label="Cine y series">
      <div className="qvh-media-section-head">
        <p className="qvh-media-section-kicker">Entretenimiento</p>
        <h3 className="qvh-media-section-title">Cine y series</h3>
      </div>

      <MediaRail kicker="Estrenos" title="En cines" events={cine} />
      <MediaRail kicker="Televisión" title="Capítulos y series" events={series} />
    </section>
  );
}
