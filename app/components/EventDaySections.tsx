"use client";

import dynamic from "next/dynamic";
import { memo, useMemo } from "react";
import type { EventRow } from "./types";
import { CategoryCarousel } from "./CategoryCarousel";
import { CategorySectionHeader } from "./CategorySectionHeader";
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
import { groupEventsForDisplay } from "../lib/event-day-group";
import {
  isChampionsCompetitionTitle,
} from "../lib/champions-week";
import { isChampionsFinal } from "../lib/event-card-stamp";

function groupForDisplay(events: EventRow[]) {
  return groupEventsForDisplay(events);
}

type Props = {
  events: EventRow[];
  emptyMessage?: string;
  /** Above-the-fold: monta las primeras secciones al instante. */
  priority?: "high" | "normal";
  appliedSports?: string[];
  isFeaturedMode?: boolean;
};

function estimateBlockHeight(eventCount: number): number {
  return Math.min(720, 96 + eventCount * 88);
}

function SportSectionBlock({
  title,
  accentClass,
  events,
  eager,
  shellClassName,
  iconId,
}: {
  title: string;
  accentClass: string;
  events: EventRow[];
  eager: boolean;
  shellClassName?: string;
  iconId: string;
}) {
  const sortedEvents = useMemo(() => sortEventsByPopularity(events), [events]);
  const blockClass = [
    "fh-section-block",
    "qvh-feed-category-shell",
    "qvh-content-auto",
    shellClassName,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <LazyMount
      eager={eager}
      minHeight={estimateBlockHeight(Math.min(events.length, 3))}
      rootMargin="560px 0px"
    >
      <div className={blockClass}>
        <div className={`fh-comp-header ${accentClass}`}>
          <CategorySectionHeader
            title={title}
            iconId={iconId}
            count={events.length}
          />
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
  appliedSports = [],
  isFeaturedMode = true,
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
        const isClWeekBlock =
          isChampionsCompetitionTitle(comp) &&
          evs.some((event) => isChampionsFinal(event));
        return (
          <SportSectionBlock
            key={comp}
            title={comp}
            iconId="futbol"
            accentClass={competitionAccentClass(comp)}
            events={evs}
            eager={eager}
            shellClassName={isClWeekBlock ? "qvh-cl-week-feed-block" : undefined}
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
            iconId={sportId}
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
          appliedSports={appliedSports}
          isFeaturedMode={isFeaturedMode}
        />
      </LazyMount>
    </>
  );
});
