"use client";

import type { EventRow } from "./types";
import { MediaPosterCard } from "./MediaPosterCard";

type Props = {
  cine: EventRow[];
  series: EventRow[];
  anime?: EventRow[];
  tvReality?: EventRow[];
  tvConcurso?: EventRow[];
  tvDirecto?: EventRow[];
};

function MediaRail({
  label,
  accent,
  count,
  events,
}: {
  label: string;
  accent: "cine" | "series" | "anime" | "tv" | "tv-concurso" | "tv-directo";
  count: number;
  events: EventRow[];
}) {
  if (events.length === 0) return null;

  return (
    <div className="qvh-media-rail-block">
      <div className="qvh-media-rail-head">
        <div className={`qvh-media-rail-accent qvh-media-rail-accent-${accent}`} />
        <div className="qvh-media-rail-copy">
          <h4 className="qvh-media-rail-title">{label}</h4>
          <span className="qvh-media-rail-count">{count}</span>
        </div>
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

export function MediaEntertainmentSection({
  cine,
  series,
  anime = [],
  tvReality = [],
  tvConcurso = [],
  tvDirecto = [],
}: Props) {
  if (
    cine.length === 0 &&
    series.length === 0 &&
    anime.length === 0 &&
    tvReality.length === 0 &&
    tvConcurso.length === 0 &&
    tvDirecto.length === 0
  ) {
    return null;
  }

  return (
    <section className="qvh-media-section" aria-label="Entretenimiento">
      <header className="qvh-media-hero">
        <div className="qvh-media-hero-glow" aria-hidden />
        <div className="qvh-media-hero-inner">
          <p className="qvh-media-hero-eyebrow">
            <span className="qvh-media-hero-dot" aria-hidden />
            Entretenimiento
          </p>
          <h3 className="qvh-media-hero-title">
            TV, Twitch, cine <span className="qvh-media-hero-amp">&</span> series{" "}
            <span className="qvh-media-hero-amp">&</span> anime
          </h3>
        </div>
        <div className="qvh-media-hero-rule" aria-hidden />
      </header>

      <MediaRail
        label="Reality"
        accent="tv"
        count={tvReality.length}
        events={tvReality}
      />
      <MediaRail
        label="Concursos"
        accent="tv-concurso"
        count={tvConcurso.length}
        events={tvConcurso}
      />
      <MediaRail
        label="Directos"
        accent="tv-directo"
        count={tvDirecto.length}
        events={tvDirecto}
      />
      <MediaRail
        label="En cines"
        accent="cine"
        count={cine.length}
        events={cine}
      />
      <MediaRail
        label="Capítulos y series"
        accent="series"
        count={series.length}
        events={series}
      />
      <MediaRail
        label="Anime"
        accent="anime"
        count={anime.length}
        events={anime}
      />
    </section>
  );
}
