"use client";

import { memo, useMemo } from "react";
import type { EventRow } from "./types";
import { MatchCard } from "./MatchCard";
import { MediaEntertainmentSection } from "./MediaEntertainmentSection";
import { competitionAccentClass, sportAccentClass } from "../lib/sport-accent";
import { sportLabel } from "../lib/filter-config";
import { getTvShowCategory } from "../lib/tv-show-category";

function groupForDisplay(events: EventRow[]) {
  const football: Record<string, EventRow[]> = {};
  const bySport: Record<string, { label: string; sportId: string; events: EventRow[] }> =
    {};
  const cine: EventRow[] = [];
  const series: EventRow[] = [];
  const tvReality: EventRow[] = [];
  const tvConcurso: EventRow[] = [];
  const tvEvento: EventRow[] = [];

  for (const e of events) {
    if (e.sport === "futbol") {
      const key = (e.competition || "Fútbol").split(" · ")[0];
      if (!football[key]) football[key] = [];
      football[key].push(e);
    } else if (e.sport === "cine") {
      cine.push(e);
    } else if (e.sport === "series") {
      series.push(e);
    } else if (e.sport === "tv") {
      const category = getTvShowCategory(e);
      if (category === "concurso") tvConcurso.push(e);
      else if (category === "evento") tvEvento.push(e);
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

  return { football, bySport, cine, series, tvReality, tvConcurso, tvEvento };
}

type Props = {
  events: EventRow[];
  emptyMessage?: string;
};

export const EventDaySections = memo(function EventDaySections({
  events,
  emptyMessage,
}: Props) {
  const sections = useMemo(() => groupForDisplay(events), [events]);

  if (events.length === 0) {
    return emptyMessage ? (
      <div className="fh-day-empty">
        <p>{emptyMessage}</p>
      </div>
    ) : null;
  }

  return (
    <>
      {Object.entries(sections.football).map(([comp, evs]) => (
        <div key={comp} className="fh-section-block">
          <div className={`fh-comp-header ${competitionAccentClass(comp)}`}>
            <h3>{comp}</h3>
            <span className="fh-comp-count">{evs.length}</span>
          </div>
          <div className="fh-match-grid">
            {evs.map((e) => (
              <MatchCard key={e.id} event={e} />
            ))}
          </div>
        </div>
      ))}

      {Object.values(sections.bySport).map(({ label, sportId, events: evs }) => (
        <div key={sportId} className="fh-section-block">
          <div className={`fh-comp-header ${sportAccentClass(sportId)}`}>
            <h3>{label}</h3>
            <span className="fh-comp-count">{evs.length}</span>
          </div>
          <div className="fh-match-grid">
            {evs.map((e) => (
              <MatchCard key={e.id} event={e} />
            ))}
          </div>
        </div>
      ))}

      <MediaEntertainmentSection
        cine={sections.cine}
        series={sections.series}
        tvReality={sections.tvReality}
        tvConcurso={sections.tvConcurso}
        tvEvento={sections.tvEvento}
      />
    </>
  );
});
