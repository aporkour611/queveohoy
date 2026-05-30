"use client";

import { useMemo } from "react";
import type { EventRow } from "./types";
import { CategoryCarousel } from "./CategoryCarousel";
import { TvBroadcastCard } from "./TvBroadcastCard";
import { CategoryIcon } from "./CategoryIcon";
import { sortEventsChronologically } from "../lib/sort-events-by-priority";
import { hasSpanishDisplayTitle } from "../lib/spanish-display-title";

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
  const iconId =
    accent === "reality"
      ? "tv-reality"
      : accent === "concurso"
        ? "tv-concurso"
        : "tv-directo";
  const sortedEvents = useMemo(
    () =>
      sortEventsChronologically(
        events.filter((event) => hasSpanishDisplayTitle(event.title))
      ),
    [events]
  );

  if (sortedEvents.length === 0) return null;

  return (
    <div
      className={`qvh-tv-group qvh-feed-category-shell qvh-tv-group-accented-${accent}`}
    >
      <div className="qvh-tv-group-head">
        <CategoryIcon id={iconId} size={20} className="qvh-tv-group-icon" />
        <span className={`qvh-tv-group-accent qvh-tv-group-accent-${accent}`} />
        <h4 className="qvh-tv-group-title">{label}</h4>
        <span className="qvh-tv-group-count">{sortedEvents.length}</span>
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
