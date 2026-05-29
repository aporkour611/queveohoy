"use client";

import { useMemo } from "react";
import type { EventRow } from "./types";
import {
  CategoryCarousel,
  CATEGORY_CAROUSEL_ANIME_SLOTS,
} from "./CategoryCarousel";
import { MediaPosterCard } from "./MediaPosterCard";
import { sortEventsByPopularity } from "../lib/sort-events-by-priority";

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
  visibleSlots,
  carouselClassName,
  compact = false,
  spotlightAspect = false,
}: {
  label: string;
  accent: "cine" | "series" | "anime";
  count: number;
  events: EventRow[];
  visibleSlots?: number;
  carouselClassName?: string;
  compact?: boolean;
  spotlightAspect?: boolean;
}) {
  const sortedEvents = useMemo(() => sortEventsByPopularity(events), [events]);

  if (events.length === 0) return null;

  return (
    <div className="qvh-catalog-rail-block qvh-feed-category-shell">
      <div className="qvh-catalog-rail-head">
        <div className={`qvh-catalog-rail-accent qvh-catalog-rail-accent-${accent}`} />
        <div className="qvh-catalog-rail-copy">
          <h4 className="qvh-catalog-rail-title">{label}</h4>
          <span className="qvh-catalog-rail-count">{count}</span>
        </div>
      </div>
      <CategoryCarousel
        ariaLabel={label}
        visibleSlots={visibleSlots}
        className={["qvh-category-carousel-posters", carouselClassName]
          .filter(Boolean)
          .join(" ")}
      >
        {sortedEvents.map((event, index) => (
          <MediaPosterCard
            key={event.id}
            event={event}
            index={index}
            compact={compact}
            cine={accent === "cine"}
            spotlightAspect={spotlightAspect}
          />
        ))}
      </CategoryCarousel>
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
        spotlightAspect
      />
      <CatalogRail
        label="Anime"
        accent="anime"
        count={anime.length}
        events={anime}
        visibleSlots={CATEGORY_CAROUSEL_ANIME_SLOTS}
        carouselClassName="qvh-category-carousel-anime"
        compact
      />
    </section>
  );
}
