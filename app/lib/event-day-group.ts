import type { EventRow } from "../components/types";
import { resolveFeedSport } from "./anime-classify";
import { sportLabel } from "./filter-config";
import { getTvShowCategory, isTvFictionSeriesEvent } from "./tv-show-category";

export type EventDayGroups = {
  football: Record<string, EventRow[]>;
  bySport: Record<string, { label: string; sportId: string; events: EventRow[] }>;
  cine: EventRow[];
  series: EventRow[];
  anime: EventRow[];
  tvReality: EventRow[];
  tvConcurso: EventRow[];
  tvDirecto: EventRow[];
};

export function groupEventsForDisplay(events: EventRow[]): EventDayGroups {
  const football: Record<string, EventRow[]> = {};
  const bySport: Record<
    string,
    { label: string; sportId: string; events: EventRow[] }
  > = {};
  const cine: EventRow[] = [];
  const series: EventRow[] = [];
  const anime: EventRow[] = [];
  const tvReality: EventRow[] = [];
  const tvConcurso: EventRow[] = [];
  const tvDirecto: EventRow[] = [];

  for (const event of events) {
    const sport = resolveFeedSport(event);

    if (sport === "futbol") {
      const key = (event.competition || "Fútbol").split(" · ")[0];
      if (!football[key]) football[key] = [];
      football[key].push(event);
    } else if (sport === "cine") {
      cine.push(event);
    } else if (sport === "series") {
      series.push(event);
    } else if (sport === "anime") {
      anime.push(event);
    } else if (event.sport === "tv") {
      if (isTvFictionSeriesEvent(event)) {
        series.push(event);
      } else {
        const category = getTvShowCategory(event);
        if (category === "concurso") tvConcurso.push(event);
        else if (category === "directo") tvDirecto.push(event);
        else if (category === "reality") tvReality.push(event);
      }
    } else {
      const sportId = event.sport ?? "otros";
      if (!bySport[sportId]) {
        bySport[sportId] = {
          label: sportLabel(sportId),
          sportId,
          events: [],
        };
      }
      bySport[sportId].events.push(event);
    }
  }

  return {
    football,
    bySport,
    cine,
    series,
    anime,
    tvReality,
    tvConcurso,
    tvDirecto,
  };
}
