"use client";

import { useMemo } from "react";
import type { EventRow } from "./types";
import { pickCuratedDestacados } from "../lib/destacados-config";
import { FeaturedEventCard } from "./FeaturedEventCard";

type Props = {
  events: EventRow[];
};

export function DestacadosSection({ events }: Props) {
  const featured = useMemo(() => pickCuratedDestacados(events), [events]);

  if (featured.length === 0) return null;

  return (
    <section className="qvh-destacados" aria-label="Lo más visto">
      <div className="qvh-destacados-head">
        <div className="qvh-destacados-brand">
          <span className="qvh-destacados-dot" aria-hidden />
          <div>
            <h2 className="qvh-destacados-title">Lo más visto</h2>
          </div>
        </div>
      </div>

      <div className="qvh-destacados-scroll">
        {featured.map((event) => (
          <FeaturedEventCard key={event.id} event={event} />
        ))}
      </div>
    </section>
  );
}
