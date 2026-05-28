"use client";

import { useEffect, useRef, useState } from "react";
import type { EventRow } from "./types";
import { MatchCard } from "./MatchCard";

const INITIAL_VISIBLE = 6;
const LOAD_BATCH = 8;

type Props = {
  events: EventRow[];
  /** Renderiza todas las tarjetas de golpe (secciones pequeñas o above-the-fold). */
  eager?: boolean;
};

/** Grid que va pintando tarjetas a medida que te acercas al final (scroll infinito ligero). */
export function LazyMatchGrid({ events, eager = false }: Props) {
  const [visibleCount, setVisibleCount] = useState(() =>
    eager ? events.length : Math.min(INITIAL_VISIBLE, events.length)
  );
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVisibleCount(
      eager ? events.length : Math.min(INITIAL_VISIBLE, events.length)
    );
  }, [events, eager]);

  useEffect(() => {
    if (eager || visibleCount >= events.length) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setVisibleCount((count) => Math.min(count + LOAD_BATCH, events.length));
      },
      { rootMargin: "480px 0px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [eager, visibleCount, events.length]);

  if (events.length === 0) return null;

  const visibleEvents = events.slice(0, visibleCount);
  const hasMore = visibleCount < events.length;

  return (
    <>
      <div className="fh-match-grid">
        {visibleEvents.map((event) => (
          <MatchCard key={event.id} event={event} />
        ))}
      </div>
      {hasMore ? (
        <div ref={sentinelRef} className="fh-lazy-sentinel" aria-hidden />
      ) : null}
    </>
  );
}
