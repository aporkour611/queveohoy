"use client";

import { memo, useMemo } from "react";
import {
  CategoryCarousel,
  CATEGORY_CAROUSEL_ANIME_SLOTS,
} from "./CategoryCarousel";
import { CategoryIcon } from "./CategoryIcon";
import { FeedSectionHero } from "./FeedSectionHero";
import { LazyMount } from "./LazyMount";
import { MatchCard } from "./MatchCard";
import { MediaPosterCard } from "./MediaPosterCard";
import { TvBroadcastCard } from "./TvBroadcastCard";
import {
  sortEventsByPopularity,
  sortEventsChronologically,
} from "../lib/sort-events-by-priority";
import { competitionAccentClass, sportAccentClass } from "../lib/sport-accent";
import {
  isChampionsCompetitionTitle,
} from "../lib/champions-week";
import { isUfcWeekMainEvent } from "../lib/ufc-week";
import { isChampionsFinal } from "../lib/event-card-stamp";
import type { EventDayGroups } from "../lib/event-day-group";
import {
  sortEsportsEntries,
  sortMotorEntries,
  sortSportEntries,
} from "../lib/event-day-sports-split";
import { hasSpanishDisplayTitle } from "../lib/spanish-display-title";
import {
  FEED_PANEL_CONFIG,
  type FeedPanelCardLayout,
  type FeedPanelSectionProps,
  type FeedPanelSubgroup,
  type FeedPanelVariant,
} from "../lib/feed-panel-config";

export type { FeedPanelVariant, FeedPanelSubgroup };

type Props = FeedPanelSectionProps & {
  priority?: "high" | "normal";
};

function estimateBlockHeight(eventCount: number, cardLayout: FeedPanelCardLayout): number {
  if (cardLayout === "poster" || cardLayout === "poster-cine" || cardLayout === "poster-anime") {
    return Math.min(520, 120 + eventCount * 140);
  }
  if (cardLayout === "tv") {
    return Math.min(640, 100 + eventCount * 96);
  }
  return Math.min(720, 96 + eventCount * 88);
}

function PanelSubgroup({
  label,
  iconId,
  accentClass,
  events,
  shellClassName,
  cardLayout = "match",
}: FeedPanelSubgroup) {
  const sortedEvents = useMemo(() => {
    if (cardLayout === "tv" || cardLayout.startsWith("poster")) {
      return sortEventsChronologically(
        events.filter((event) => hasSpanishDisplayTitle(event.title))
      );
    }
    return sortEventsByPopularity(events);
  }, [events, cardLayout]);

  if (sortedEvents.length === 0) return null;

  const blockClass = ["qvh-feed-group", shellClassName, accentClass]
    .filter(Boolean)
    .join(" ");

  const carouselClass =
    cardLayout === "tv"
      ? "qvh-category-carousel-tv"
      : cardLayout.startsWith("poster")
        ? cardLayout === "poster-anime"
          ? "qvh-category-carousel-posters qvh-category-carousel-anime"
          : "qvh-category-carousel-posters"
        : "qvh-category-carousel-cards";

  return (
    <div className={blockClass}>
      <div className="qvh-feed-group-head">
        <CategoryIcon id={iconId} size={20} className="qvh-feed-group-icon" />
        <h4 className="qvh-feed-group-title">{label}</h4>
        <span className="qvh-feed-group-count">{sortedEvents.length}</span>
      </div>
      <CategoryCarousel
        ariaLabel={label}
        className={carouselClass}
        visibleSlots={
          cardLayout === "poster-anime" ? CATEGORY_CAROUSEL_ANIME_SLOTS : undefined
        }
      >
        {sortedEvents.map((event, index) => {
          if (cardLayout === "tv") {
            return <TvBroadcastCard key={event.id} event={event} index={index} />;
          }
          if (cardLayout.startsWith("poster")) {
            return (
              <MediaPosterCard
                key={event.id}
                event={event}
                index={index}
                compact
                cine={cardLayout === "poster-cine"}
                spotlightAspect={cardLayout === "poster"}
              />
            );
          }
          return <MatchCard key={event.id} event={event} />;
        })}
      </CategoryCarousel>
    </div>
  );
}

function buildSportSubgroups(
  panel: FeedPanelVariant,
  football: EventDayGroups["football"],
  bySport: EventDayGroups["bySport"]
): FeedPanelSubgroup[] {
  const result: FeedPanelSubgroup[] = [];

  if (panel === "sports") {
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
        cardLayout: "match",
      });
    }
  }

  const entries =
    panel === "esports"
      ? sortEsportsEntries(bySport)
      : panel === "motor"
        ? sortMotorEntries(bySport)
        : sortSportEntries(bySport);

  for (const { label, sportId, events: evs } of entries) {
    if (evs.length === 0) continue;
    const isUfcWeekBlock =
      sportId === "ufc" && evs.some((event) => isUfcWeekMainEvent(event));
    result.push({
      key: sportId,
      label,
      iconId: sportId,
      accentClass: sportAccentClass(sportId),
      events: evs,
      shellClassName: isUfcWeekBlock ? "qvh-ufc-week-feed-block" : undefined,
      cardLayout: "match",
    });
  }

  return result;
}

export const FeedPanelSection = memo(function FeedPanelSection({
  panel,
  football = {},
  bySport = {},
  subgroups,
  titleOverride,
  leadOverride,
  ariaLabelOverride,
  priority = "normal",
}: Props) {
  const config = FEED_PANEL_CONFIG[panel];
  const highPriority = priority === "high";

  const blocks = useMemo(
    () => subgroups ?? buildSportSubgroups(panel, football, bySport),
    [subgroups, panel, football, bySport]
  );

  if (blocks.length === 0) return null;

  return (
    <section
      className={config.sectionClass}
      aria-label={ariaLabelOverride ?? config.ariaLabel}
    >
      <FeedSectionHero
        variant={config.heroVariant}
        eyebrow={config.eyebrow}
        title={titleOverride ?? config.title}
        lead={leadOverride ?? config.lead}
      />

      {blocks.map((block, index) => (
        <LazyMount
          key={block.key}
          eager={highPriority && index < 2}
          minHeight={estimateBlockHeight(
            Math.min(block.events.length, 3),
            block.cardLayout ?? "match"
          )}
          rootMargin="560px 0px"
        >
          <PanelSubgroup {...block} />
        </LazyMount>
      ))}
    </section>
  );
});
