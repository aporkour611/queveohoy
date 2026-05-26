"use client";

import type { EventRow } from "./types";
import { MatchCard } from "./MatchCard";
import { MediaEntertainmentSection } from "./MediaEntertainmentSection";
import { competitionAccentClass, sportAccentClass } from "../lib/sport-accent";
import { sportLabel } from "../lib/filter-config";

function groupForDisplay(events: EventRow[]) {
  const football: Record<string, EventRow[]> = {};
  const bySport: Record<string, { label: string; sportId: string; events: EventRow[] }> =
    {};
  const cine: EventRow[] = [];
  const series: EventRow[] = [];
  const tv: EventRow[] = [];

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
      tv.push(e);
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

  return { football, bySport, cine, series, tv };
}

type Props = {
  events: EventRow[];
  emptyMessage?: string;
};

export function EventDaySections({ events, emptyMessage }: Props) {
  if (events.length === 0) {
    return emptyMessage ? (
      <div className="fh-day-empty">
        <p>{emptyMessage}</p>
      </div>
    ) : null;
  }

  const sections = groupForDisplay(events);

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
        tv={sections.tv}
      />
    </>
  );
}
