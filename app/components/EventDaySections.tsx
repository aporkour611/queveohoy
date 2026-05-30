"use client";

import dynamic from "next/dynamic";
import { memo, useMemo } from "react";
import type { EventRow } from "./types";
import { CategoryCarousel } from "./CategoryCarousel";
import { CategorySectionHeader } from "./CategorySectionHeader";
import { MatchCard } from "./MatchCard";
import { LazyMount } from "./LazyMount";
import { SportsEsportsFeedSection } from "./SportsEsportsFeedSection";
import { sortEventsByPopularity } from "../lib/sort-events-by-priority";
import { sportAccentClass } from "../lib/sport-accent";
import { groupEventsForDisplay } from "../lib/event-day-group";
import { splitMotorFromSportsEsports } from "../lib/event-day-sports-split";

const MediaEntertainmentSection = dynamic(
  () =>
    import("./MediaEntertainmentSection").then(
      (mod) => mod.MediaEntertainmentSection
    ),
  { loading: () => null }
);

function estimateBlockHeight(eventCount: number): number {
  return Math.min(720, 96 + eventCount * 88);
}

function MotorSectionBlock({
  title,
  accentClass,
  events,
  eager,
  iconId,
}: {
  title: string;
  accentClass: string;
  events: EventRow[];
  eager: boolean;
  iconId: string;
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

type Props = {
  events: EventRow[];
  emptyMessage?: string;
  priority?: "high" | "normal";
  appliedSports?: string[];
  isFeaturedMode?: boolean;
};

export const EventDaySections = memo(function EventDaySections({
  events,
  emptyMessage,
  priority = "normal",
  appliedSports = [],
  isFeaturedMode = true,
}: Props) {
  const sections = useMemo(() => groupEventsForDisplay(events), [events]);
  const { motor, sportsEsports } = useMemo(
    () => splitMotorFromSportsEsports(sections.bySport),
    [sections.bySport]
  );
  const motorBlocks = useMemo(() => Object.values(motor), [motor]);
  const highPriority = priority === "high";

  if (events.length === 0) {
    return emptyMessage ? (
      <div className="fh-day-empty">
        <p>{emptyMessage}</p>
      </div>
    ) : null;
  }

  return (
    <>
      <SportsEsportsFeedSection
        football={sections.football}
        sportsEsports={sportsEsports}
        priority={priority}
      />

      {motorBlocks.map(({ label, sportId, events: evs }, index) => (
        <MotorSectionBlock
          key={sportId}
          title={label}
          iconId={sportId}
          accentClass={sportAccentClass(sportId)}
          events={evs}
          eager={highPriority && index < 2}
        />
      ))}

      <LazyMount
        eager={highPriority && motorBlocks.length === 0}
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
