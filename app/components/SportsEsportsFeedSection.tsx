"use client";

import { memo, useMemo } from "react";
import type { EventRow } from "./types";
import { CategoryCarousel } from "./CategoryCarousel";
import { CategoryIcon } from "./CategoryIcon";
import { FeedSectionHero } from "./FeedSectionHero";
import { LazyMount } from "./LazyMount";
import { MatchCard } from "./MatchCard";
import { sortEventsByPopularity } from "../lib/sort-events-by-priority";
import { competitionAccentClass, sportAccentClass } from "../lib/sport-accent";
import {
  isChampionsCompetitionTitle,
} from "../lib/champions-week";
import { isChampionsFinal } from "../lib/event-card-stamp";
import type { EventDayGroups } from "../lib/event-day-group";
import { sortSportsEsportsEntries } from "../lib/event-day-sports-split";

type Props = {
  football: EventDayGroups["football"];
  sportsEsports: EventDayGroups["bySport"];
  priority?: "high" | "normal";
};

type SubgroupBlock = {
  key: string;
  label: string;
  iconId: string;
  accentClass?: string;
  events: EventRow[];
  shellClassName?: string;
};

function estimateBlockHeight(eventCount: number): number {
  return Math.min(720, 96 + eventCount * 88);
}

function SportsSubgroup({
  label,
  iconId,
  accentClass,
  events,
  shellClassName,
}: Omit<SubgroupBlock, "key">) {
  const sortedEvents = useMemo(() => sortEventsByPopularity(events), [events]);
  if (sortedEvents.length === 0) return null;

  const blockClass = [
    "qvh-sports-group",
    "qvh-feed-category-shell",
    shellClassName,
    accentClass,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={blockClass}>
      <div className="qvh-sports-group-head">
        <CategoryIcon id={iconId} size={20} className="qvh-sports-group-icon" />
        <h4 className="qvh-sports-group-title">{label}</h4>
        <span className="qvh-sports-group-count">{sortedEvents.length}</span>
      </div>
      <CategoryCarousel ariaLabel={label} className="qvh-category-carousel-cards">
        {sortedEvents.map((event) => (
          <MatchCard key={event.id} event={event} />
        ))}
      </CategoryCarousel>
    </div>
  );
}

export const SportsEsportsFeedSection = memo(function SportsEsportsFeedSection({
  football,
  sportsEsports,
  priority = "normal",
}: Props) {
  const blocks = useMemo(() => {
    const result: SubgroupBlock[] = [];

    for (const [comp, evs] of Object.entries(football)) {
      if (evs.length === 0) continue;
      const isClWeekBlock =
        isChampionsCompetitionTitle(comp) &&
        evs.some((event) => isChampionsFinal(event));
      result.push({
        key: comp,
        label: comp,
        iconId: "futbol",
        accentClass: competitionAccentClass(comp),
        events: evs,
        shellClassName: isClWeekBlock ? "qvh-cl-week-feed-block" : undefined,
      });
    }

    for (const { label, sportId, events: evs } of sortSportsEsportsEntries(sportsEsports)) {
      if (evs.length === 0) continue;
      result.push({
        key: sportId,
        label,
        iconId: sportId,
        accentClass: sportAccentClass(sportId),
        events: evs,
      });
    }

    return result;
  }, [football, sportsEsports]);

  const highPriority = priority === "high";

  if (blocks.length === 0) return null;

  return (
    <section className="qvh-sports-section" aria-label="Deportes y E-Sports">
      <FeedSectionHero
        variant="sports"
        eyebrow="Deportes"
        title="Deportes y E-Sports"
        lead="Fútbol, tenis, baloncesto, UFC, CS2, Valorant y LoL con horario y canal en España"
      />

      {blocks.map((block, index) => (
        <LazyMount
          key={block.key}
          eager={highPriority && index < 2}
          minHeight={estimateBlockHeight(Math.min(block.events.length, 3))}
          rootMargin="560px 0px"
        >
          <SportsSubgroup {...block} />
        </LazyMount>
      ))}
    </section>
  );
});
