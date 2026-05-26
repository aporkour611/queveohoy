"use client";

import { useMemo } from "react";
import type { EventRow } from "./types";
import {
  mergeDestacadosWithFavorites,
  pickCuratedDestacados,
} from "../lib/destacados-config";
import { useFavorites } from "../lib/favorites-context";
import { FeaturedEventCard } from "./FeaturedEventCard";

type Props = {
  events: EventRow[];
};

export function DestacadosSection({ events }: Props) {
  const { isLoggedIn, favoriteEvents } = useFavorites();

  const featured = useMemo(() => {
    const curated = pickCuratedDestacados(events);
    if (!isLoggedIn || favoriteEvents.length === 0) return curated;
    return mergeDestacadosWithFavorites(curated, favoriteEvents);
  }, [events, favoriteEvents, isLoggedIn]);

  if (featured.length === 0) return null;

  const hasUserFavorites = isLoggedIn && favoriteEvents.length > 0;

  return (
    <section className="qvh-destacados" aria-label="Destacados">
      <div className="qvh-destacados-head">
        <div className="qvh-destacados-brand">
          <span className="qvh-destacados-dot" aria-hidden />
          <div>
            <h2 className="qvh-destacados-title">Destacados</h2>
            <p className="qvh-destacados-sub">
              {hasUserFavorites
                ? "Tus favoritos y selección editorial"
                : "Selección editorial"}
            </p>
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
