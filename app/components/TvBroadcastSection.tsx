"use client";

import { useMemo } from "react";
import type { EventRow } from "./types";
import { CategoryCarousel } from "./CategoryCarousel";
import { TvBroadcastCard } from "./TvBroadcastCard";
import { sortEventsByPopularity } from "../lib/sort-events-by-priority";

type Props = {
  tvReality?: EventRow[];
  tvConcurso?: EventRow[];
  tvDirecto?: EventRow[];
};

function TvBroadcastGroup({
  label,
  accent,
  events,
}: {
  label: string;
  accent: "reality" | "concurso" | "directo";
  events: EventRow[];
}) {
  const sortedEvents = useMemo(() => sortEventsByPopularity(events), [events]);

  if (events.length === 0) return null;

  return (
    <div className="qvh-tv-group qvh-feed-category-shell">
      <div className="qvh-tv-group-head">
        <span className={`qvh-tv-group-accent qvh-tv-group-accent-${accent}`} />
        <h4 className="qvh-tv-group-title">{label}</h4>
        <span className="qvh-tv-group-count">{events.length}</span>
      </div>
      <CategoryCarousel ariaLabel={label} className="qvh-category-carousel-tv">
        {sortedEvents.map((event, index) => (
          <TvBroadcastCard key={event.id} event={event} index={index} />
        ))}
      </CategoryCarousel>
    </div>
  );
}

export function TvBroadcastSection({
  tvReality = [],
  tvConcurso = [],
  tvDirecto = [],
}: Props) {
  if (tvReality.length === 0 && tvConcurso.length === 0 && tvDirecto.length === 0) {
    return null;
  }

  return (
    <section className="qvh-tv-section" aria-label="TV y Twitch">
      <header className="qvh-tv-hero">
        <div className="qvh-tv-hero-glow" aria-hidden />
        <p className="qvh-tv-hero-eyebrow">
          <span className="qvh-tv-hero-dot" aria-hidden />
          Televisión
        </p>
        <h3 className="qvh-tv-hero-title">TV y Twitch</h3>
        <p className="qvh-tv-hero-lead">
          Reality, concursos y programas en directo con horario en España
        </p>
      </header>

      <TvBroadcastGroup label="TV" accent="directo" events={tvDirecto} />
      <TvBroadcastGroup label="Concursos" accent="concurso" events={tvConcurso} />
      <TvBroadcastGroup label="Reality" accent="reality" events={tvReality} />
    </section>
  );
}
