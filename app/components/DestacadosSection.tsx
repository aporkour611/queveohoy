"use client";

import { useMemo } from "react";
import type { EventRow } from "./types";
import { pickCuratedDestacados } from "../lib/destacados-config";
import { FEED_DAY_COUNT } from "../lib/events-feed";
import { buildDisplayDays, MADRID_TZ } from "../lib/timezone";
import { FeaturedEventCard } from "./FeaturedEventCard";

type Props = {
  events: EventRow[];
};

export function DestacadosSection({ events }: Props) {
  const todayKey = useMemo(
    () => buildDisplayDays(MADRID_TZ, FEED_DAY_COUNT)[0]?.date ?? "",
    []
  );
  const featured = useMemo(
    () => pickCuratedDestacados(events, { scope: "today", todayKey }),
    [events, todayKey]
  );

  if (featured.length === 0) return null;

  return (
    <section className="qvh-destacados" aria-label="Lo imprescindible">
      <div className="qvh-destacados-head">
        <div className="qvh-destacados-brand">
          <span className="qvh-destacados-dot" aria-hidden />
          <div>
            <h2 className="qvh-destacados-title">Lo imprescindible</h2>
            <p className="qvh-destacados-sub">
              Solo lo de hoy en España — deportes, realities y estrenos
            </p>
          </div>
        </div>
      </div>

      <div className="qvh-destacados-scroll">
        {featured.map((event, index) => (
          <FeaturedEventCard
            key={event.id}
            event={event}
            priority={index < 2}
          />
        ))}
      </div>
    </section>
  );
}
