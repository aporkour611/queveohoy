"use client";

import type { EventRow } from "./types";
import { MediaPosterCard } from "./MediaPosterCard";

type Props = {
  cine: EventRow[];
  series: EventRow[];
  anime?: EventRow[];
};

function CatalogRail({
  label,
  accent,
  count,
  events,
}: {
  label: string;
  accent: "cine" | "series" | "anime";
  count: number;
  events: EventRow[];
}) {
  if (events.length === 0) return null;

  return (
    <div className="qvh-catalog-rail-block">
      <div className="qvh-catalog-rail-head">
        <div className={`qvh-catalog-rail-accent qvh-catalog-rail-accent-${accent}`} />
        <div className="qvh-catalog-rail-copy">
          <h4 className="qvh-catalog-rail-title">{label}</h4>
          <span className="qvh-catalog-rail-count">{count}</span>
        </div>
      </div>
      <div className="qvh-catalog-rail-scroll">
        <div className="qvh-catalog-rail-track">
          {events.map((event, index) => (
            <MediaPosterCard key={event.id} event={event} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function CatalogMediaSection({
  cine,
  series,
  anime = [],
}: Props) {
  if (cine.length === 0 && series.length === 0 && anime.length === 0) {
    return null;
  }

  return (
    <section className="qvh-catalog-section" aria-label="Cine, series y anime">
      <header className="qvh-catalog-hero">
        <div className="qvh-catalog-hero-glow" aria-hidden />
        <div className="qvh-catalog-hero-inner">
          <p className="qvh-catalog-hero-eyebrow">
            <span className="qvh-catalog-hero-dot" aria-hidden />
            Streaming
          </p>
          <h3 className="qvh-catalog-hero-title">
            Cine, series <span className="qvh-catalog-hero-amp">&</span> anime
          </h3>
        </div>
        <div className="qvh-catalog-hero-rule" aria-hidden />
      </header>

      <CatalogRail label="En cines" accent="cine" count={cine.length} events={cine} />
      <CatalogRail
        label="Capítulos y series"
        accent="series"
        count={series.length}
        events={series}
      />
      <CatalogRail label="Anime" accent="anime" count={anime.length} events={anime} />
    </section>
  );
}
