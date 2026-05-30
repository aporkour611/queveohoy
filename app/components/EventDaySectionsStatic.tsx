import { groupEventsForDisplay } from "../lib/event-day-group";
import {
  splitMotorFromSportsEsports,
  splitSportsFromEsports,
} from "../lib/event-day-sports-split";
import type { EventRow } from "./types";
import { FeedPanelSectionStatic } from "./FeedPanelSectionStatic";
import type { FeedPanelSubgroup } from "../lib/feed-panel-config";

type Props = {
  events: EventRow[];
  emptyMessage?: string;
  /** Sin pósters en tarjetas (SSR home: protege LCP de destacados). */
  omitCovers?: boolean;
};

function buildTvSubgroups(sections: ReturnType<typeof groupEventsForDisplay>): FeedPanelSubgroup[] {
  const groups: FeedPanelSubgroup[] = [];
  if (sections.tvDirecto.length > 0) {
    groups.push({
      key: "directo",
      label: "TV",
      iconId: "tv-directo",
      events: sections.tvDirecto,
    });
  }
  if (sections.tvConcurso.length > 0) {
    groups.push({
      key: "concurso",
      label: "Concursos",
      iconId: "tv-concurso",
      events: sections.tvConcurso,
    });
  }
  if (sections.tvReality.length > 0) {
    groups.push({
      key: "reality",
      label: "Reality",
      iconId: "tv-reality",
      events: sections.tvReality,
    });
  }
  return groups;
}

function buildCatalogSubgroups(sections: ReturnType<typeof groupEventsForDisplay>): FeedPanelSubgroup[] {
  const groups: FeedPanelSubgroup[] = [];
  if (sections.cine.length > 0) {
    groups.push({ key: "cine", label: "En cines", iconId: "cine", events: sections.cine });
  }
  if (sections.series.length > 0) {
    groups.push({
      key: "series",
      label: "Capítulos y series",
      iconId: "series",
      events: sections.series,
    });
  }
  if (sections.anime.length > 0) {
    groups.push({ key: "anime", label: "Anime", iconId: "anime", events: sections.anime });
  }
  return groups;
}

export function EventDaySectionsStatic({
  events,
  emptyMessage,
  omitCovers = false,
}: Props) {
  if (events.length === 0) {
    return emptyMessage ? (
      <div className="fh-day-empty">
        <p>{emptyMessage}</p>
      </div>
    ) : null;
  }

  const sections = groupEventsForDisplay(events);
  const { motor, sportsEsports } = splitMotorFromSportsEsports(sections.bySport);
  const { sports, esports } = splitSportsFromEsports(sportsEsports);

  return (
    <>
      <FeedPanelSectionStatic
        panel="sports"
        football={sections.football}
        bySport={sports}
        omitCovers={omitCovers}
      />

      <FeedPanelSectionStatic
        panel="esports"
        bySport={esports}
        omitCovers={omitCovers}
      />

      <FeedPanelSectionStatic
        panel="motor"
        bySport={motor}
        omitCovers={omitCovers}
      />

      <FeedPanelSectionStatic
        panel="tv"
        subgroups={buildTvSubgroups(sections)}
        omitCovers={omitCovers}
      />

      <FeedPanelSectionStatic
        panel="catalog"
        subgroups={buildCatalogSubgroups(sections)}
        omitCovers={omitCovers}
      />
    </>
  );
}
