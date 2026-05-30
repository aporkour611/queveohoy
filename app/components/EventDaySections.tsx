"use client";

import dynamic from "next/dynamic";
import { memo, useMemo } from "react";
import type { EventRow } from "./types";
import { LazyMount } from "./LazyMount";
import { FeedPanelSection } from "./FeedPanelSection";
import { groupEventsForDisplay } from "../lib/event-day-group";
import {
  splitMotorFromSportsEsports,
  splitSportsFromEsports,
} from "../lib/event-day-sports-split";

const MediaEntertainmentSection = dynamic(
  () =>
    import("./MediaEntertainmentSection").then(
      (mod) => mod.MediaEntertainmentSection
    ),
  { loading: () => null }
);

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
  const { sports, esports } = useMemo(
    () => splitSportsFromEsports(sportsEsports),
    [sportsEsports]
  );
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
      <FeedPanelSection
        panel="sports"
        football={sections.football}
        bySport={sports}
        priority={priority}
      />

      <FeedPanelSection
        panel="esports"
        bySport={esports}
        priority={priority}
      />

      <FeedPanelSection
        panel="motor"
        bySport={motor}
        priority={priority}
      />

      <LazyMount
        eager={highPriority}
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
          priority={priority}
        />
      </LazyMount>
    </>
  );
});
