"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { EventRow } from "./types";
import { MatchCard } from "./MatchCard";

const INITIAL_VISIBLE = 6;
const LOAD_BATCH = 8;

type Props = {
  events: EventRow[];
  /** Renderiza todas las tarjetas de golpe (secciones pequeñas o above-the-fold). */
  eager?: boolean;
};

function buildEventsKey(events: EventRow[], eager: boolean): string {
  return `${eager}:${events.map((event) => event.id).join(",")}`;
}

function initialVisibleCount(events: EventRow[], eager: boolean): number {
  return eager ? events.length : Math.min(INITIAL_VISIBLE, events.length);
}

/** Grid que va pintando tarjetas a medida que te acercas al final (scroll infinito ligero). */
export function LazyMatchGrid({ events, eager = false }: Props) {
  const eventsKey = useMemo(() => buildEventsKey(events, eager), [events, eager]);
  const [visibleCount, setVisibleCount] = useState(() =>
    initialVisibleCount(events, eager)
  );
  const sentinelRef = useRef<HTMLDivElement>(null);
  const prevEventsKeyRef = useRef(eventsKey);

  useEffect(() => {
    if (prevEventsKeyRef.current === eventsKey) return;
    prevEventsKeyRef.current = eventsKey;
    setVisibleCount(initialVisibleCount(events, eager));
  }, [eventsKey, events, eager]);

  useEffect(() => {
    if (eager || visibleCount >= events.length) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setVisibleCount((current) =>
          Math.min(current + LOAD_BATCH, events.length)
        );
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
