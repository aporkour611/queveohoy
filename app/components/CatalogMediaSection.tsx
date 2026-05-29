"use client";

import { useMemo } from "react";
import type { EventRow } from "./types";
import {
  CategoryCarousel,
  CATEGORY_CAROUSEL_ANIME_SLOTS,
} from "./CategoryCarousel";
import { MediaPosterCard } from "./MediaPosterCard";
import { formatMediaGroupLabel, isMediaSportId } from "../lib/filter-config";
import {
  sortEventsByPopularity,
  sortSeriesCatalogEvents,
} from "../lib/sort-events-by-priority";

function MediaSectionTitle({ title }: { title: string }) {
  if (title === "Cine, series & anime") {
    return (
      <>
        Cine, series <span className="qvh-catalog-hero-amp">&</span> anime
      </>
    );
  }

  const parts = title.split(" & ");
  if (parts.length === 1) return <>{title}</>;

  return (
    <>
      {parts.map((part, index) => (
        <span key={part}>
          {index > 0 ? (
            <>
              {" "}
              <span className="qvh-catalog-hero-amp">&</span>{" "}
            </>
          ) : null}
          {part}
        </span>
      ))}
    </>
  );
}

type Props = {
  cine: EventRow[];
  series: EventRow[];
  anime?: EventRow[];
  appliedSports?: string[];
  isFeaturedMode?: boolean;
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
  sortSeries = false,
}: {
  label: string;
  accent: "cine" | "series" | "anime";
  count: number;
  events: EventRow[];
  visibleSlots?: number;
  carouselClassName?: string;
  compact?: boolean;
  spotlightAspect?: boolean;
  sortSeries?: boolean;
}) {
  const sortedEvents = useMemo(
    () => (sortSeries ? sortSeriesCatalogEvents(events) : sortEventsByPopularity(events)),
    [events, sortSeries]
  );

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
  appliedSports = [],
  isFeaturedMode = true,
}: Props) {
  const showCine = isFeaturedMode || appliedSports.includes("cine");
  const showSeries = isFeaturedMode || appliedSports.includes("series");
  const showAnime = isFeaturedMode || appliedSports.includes("anime");
  const visibleCine = showCine ? cine : [];
  const visibleSeries = showSeries ? series : [];
  const visibleAnime = showAnime ? anime : [];

  if (
    visibleCine.length === 0 &&
    visibleSeries.length === 0 &&
    visibleAnime.length === 0
  ) {
    return null;
  }

  const sectionTitle = isFeaturedMode
    ? "Cine, series & anime"
    : formatMediaGroupLabel(appliedSports.filter(isMediaSportId));

  return (
    <section className="qvh-catalog-section" aria-label={sectionTitle}>
      <header className="qvh-catalog-hero">
        <div className="qvh-catalog-hero-glow" aria-hidden />
        <div className="qvh-catalog-hero-inner">
          <p className="qvh-catalog-hero-eyebrow">
            <span className="qvh-catalog-hero-dot" aria-hidden />
            Streaming
          </p>
          <h3 className="qvh-catalog-hero-title">
            <MediaSectionTitle title={sectionTitle} />
          </h3>
        </div>
        <div className="qvh-catalog-hero-rule" aria-hidden />
      </header>

      <CatalogRail label="En cines" accent="cine" count={visibleCine.length} events={visibleCine} />
      <CatalogRail
        label="Capítulos y series"
        accent="series"
        count={visibleSeries.length}
        events={visibleSeries}
        spotlightAspect
        sortSeries
      />
      <CatalogRail
        label="Anime"
        accent="anime"
        count={visibleAnime.length}
        events={visibleAnime}
        visibleSlots={CATEGORY_CAROUSEL_ANIME_SLOTS}
        carouselClassName="qvh-category-carousel-anime"
        compact
      />
    </section>
  );
}
