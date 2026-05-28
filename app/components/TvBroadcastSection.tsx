"use client";

import type { EventRow } from "./types";
import { TvBroadcastCard } from "./TvBroadcastCard";

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
  if (events.length === 0) return null;

  return (
    <div className="qvh-tv-group">
      <div className="qvh-tv-group-head">
        <span className={`qvh-tv-group-accent qvh-tv-group-accent-${accent}`} />
        <h4 className="qvh-tv-group-title">{label}</h4>
        <span className="qvh-tv-group-count">{events.length}</span>
      </div>
      <div className="qvh-tv-slot-list">
        {events.map((event, index) => (
          <TvBroadcastCard key={event.id} event={event} index={index} />
        ))}
      </div>
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
          Reality, concursos y directos con horario en España
        </p>
      </header>

      <TvBroadcastGroup label="En directo" accent="directo" events={tvDirecto} />
      <TvBroadcastGroup label="Concursos" accent="concurso" events={tvConcurso} />
      <TvBroadcastGroup label="Reality" accent="reality" events={tvReality} />
    </section>
  );
}
