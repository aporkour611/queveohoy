"use client";

import "../futbolhoy-feed.css";
import dynamic from "next/dynamic";
import { memo, useMemo } from "react";
import type { EventRow } from "./types";
import { CategoryCarousel } from "./CategoryCarousel";
import { MatchCard } from "./MatchCard";
import { LazyMount } from "./LazyMount";
import { sortEventsByPopularity } from "../lib/sort-events-by-priority";
const MediaEntertainmentSection = dynamic(
  () =>
    import("./MediaEntertainmentSection").then(
      (mod) => mod.MediaEntertainmentSection
    ),
  { loading: () => null }
);
import { competitionAccentClass, sportAccentClass } from "../lib/sport-accent";
import { sportLabel } from "../lib/filter-config";
import { getTvShowCategory } from "../lib/tv-show-category";

function groupForDisplay(events: EventRow[]) {
  const football: Record<string, EventRow[]> = {};
  const bySport: Record<string, { label: string; sportId: string; events: EventRow[] }> =
    {};
  const cine: EventRow[] = [];
  const series: EventRow[] = [];
  const anime: EventRow[] = [];
  const tvReality: EventRow[] = [];
  const tvConcurso: EventRow[] = [];
  const tvDirecto: EventRow[] = [];

  for (const e of events) {
    if (e.sport === "futbol") {
      const key = (e.competition || "Fútbol").split(" · ")[0];
      if (!football[key]) football[key] = [];
      football[key].push(e);
    } else if (e.sport === "cine") {
      cine.push(e);
    } else if (e.sport === "series") {
      series.push(e);
    } else if (e.sport === "anime") {
      anime.push(e);
    } else if (e.sport === "tv") {
      const category = getTvShowCategory(e);
      if (category === "concurso") tvConcurso.push(e);
      else if (category === "directo") tvDirecto.push(e);
      else tvReality.push(e);
    } else {
      const sportId = e.sport ?? "otros";
      if (!bySport[sportId]) {
        bySport[sportId] = {
          label: sportLabel(sportId),
          sportId,
          events: [],
        };
      }
      bySport[sportId].events.push(e);
    }
  }

  return { football, bySport, cine, series, anime, tvReality, tvConcurso, tvDirecto };
}

type Props = {
  events: EventRow[];
  emptyMessage?: string;
  /** Above-the-fold: monta las primeras secciones al instante. */
  priority?: "high" | "normal";
};

function estimateBlockHeight(eventCount: number): number {
  return Math.min(720, 96 + eventCount * 88);
}

function SportSectionBlock({
  title,
  accentClass,
  events,
  eager,
}: {
  title: string;
  accentClass: string;
  events: EventRow[];
  eager: boolean;
}) {
  const sortedEvents = useMemo(() => sortEventsByPopularity(events), [events]);

  return (
    <LazyMount
      eager={eager}
      minHeight={estimateBlockHeight(Math.min(events.length, 3))}
      rootMargin="560px 0px"
    >
      <div className="fh-section-block qvh-feed-category-shell qvh-content-auto">
        <div className={`fh-comp-header ${accentClass}`}>
          <h3>{title}</h3>
          <span className="fh-comp-count">{events.length}</span>
        </div>
        <CategoryCarousel ariaLabel={title} className="qvh-category-carousel-cards">
          {sortedEvents.map((event) => (
            <MatchCard key={event.id} event={event} />
          ))}
        </CategoryCarousel>
      </div>
    </LazyMount>
  );
}

export const EventDaySections = memo(function EventDaySections({
  events,
  emptyMessage,
  priority = "normal",
}: Props) {
  const sections = useMemo(() => groupForDisplay(events), [events]);
  const highPriority = priority === "high";

  if (events.length === 0) {
    return emptyMessage ? (
      <div className="fh-day-empty">
        <p>{emptyMessage}</p>
      </div>
    ) : null;
  }

  let blockIndex = 0;

  return (
    <>
      {Object.entries(sections.football).map(([comp, evs]) => {
        const eager = highPriority && blockIndex < 2;
        blockIndex += 1;
        return (
          <SportSectionBlock
            key={comp}
            title={comp}
            accentClass={competitionAccentClass(comp)}
            events={evs}
            eager={eager}
          />
        );
      })}

      {Object.values(sections.bySport).map(({ label, sportId, events: evs }) => {
        const eager = highPriority && blockIndex < 2;
        blockIndex += 1;
        return (
          <SportSectionBlock
            key={sportId}
            title={label}
            accentClass={sportAccentClass(sportId)}
            events={evs}
            eager={eager}
          />
        );
      })}

      <LazyMount
        eager={highPriority && blockIndex === 0}
        minHeight={220}
        rootMargin="480px 0px"
      >
        <MediaEntertainmentSection
          cine={sections.cine}
          series={sections.series}
          anime={sections.anime}
          tvReality={sections.tvReality}
          tvConcurso={sections.tvConcurso}
          tvDirecto={sections.tvDirecto}
        />
      </LazyMount>
    </>
  );
});
