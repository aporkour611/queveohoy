import { competitionAccentClass, sportAccentClass } from "../lib/sport-accent";
import {
  isChampionsCompetitionTitle,
} from "../lib/champions-week";
import { isChampionsFinal } from "../lib/event-card-stamp";
import { groupEventsForDisplay } from "../lib/event-day-group";
import { sortEventsByPopularity } from "../lib/sort-events-by-priority";
import type { EventRow } from "./types";
import { MatchCardStatic } from "./MatchCardStatic";

type Props = {
  events: EventRow[];
  emptyMessage?: string;
  /** Sin pósters en tarjetas (SSR home: protege LCP de destacados). */
  omitCovers?: boolean;
};

function StaticSportBlock({
  title,
  accentClass,
  events,
  shellClassName,
  omitCovers = false,
}: {
  title: string;
  accentClass: string;
  events: EventRow[];
  shellClassName?: string;
  omitCovers?: boolean;
}) {
  const sortedEvents = sortEventsByPopularity(events);
  const blockClass = [
    "fh-section-block",
    "qvh-feed-category-shell",
    "qvh-content-auto",
    shellClassName,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={blockClass}>
      <div className={`fh-comp-header ${accentClass}`}>
        <h3>{title}</h3>
        <span className="fh-comp-count">{events.length}</span>
      </div>
      <div className="qvh-category-carousel-cards fh-category-carousel-static">
        {sortedEvents.map((event) => (
          <div key={event.id} className="fh-cardcol">
            <MatchCardStatic event={event} omitCover={omitCovers} />
          </div>
        ))}
      </div>
    </div>
  );
}

function StaticMediaGroup({
  title,
  accentClass,
  events,
  omitCovers = false,
}: {
  title: string;
  accentClass: string;
  events: EventRow[];
  omitCovers?: boolean;
}) {
  if (events.length === 0) return null;
  return (
    <StaticSportBlock
      title={title}
      accentClass={accentClass}
      events={events}
      omitCovers={omitCovers}
    />
  );
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

  return (
    <>
      {Object.entries(sections.football).map(([comp, evs]) => {
        const isClWeekBlock =
          isChampionsCompetitionTitle(comp) &&
          evs.some((event) => isChampionsFinal(event));
        return (
          <StaticSportBlock
            key={comp}
            title={comp}
            accentClass={competitionAccentClass(comp)}
            events={evs}
            shellClassName={isClWeekBlock ? "qvh-cl-week-feed-block" : undefined}
            omitCovers={omitCovers}
          />
        );
      })}

      {Object.values(sections.bySport).map(({ label, sportId, events: evs }) => (
        <StaticSportBlock
          key={sportId}
          title={label}
          accentClass={sportAccentClass(sportId)}
          events={evs}
          omitCovers={omitCovers}
        />
      ))}

      <StaticMediaGroup title="Cine" accentClass="fh-accent-cine" events={sections.cine} omitCovers={omitCovers} />
      <StaticMediaGroup title="Series" accentClass="fh-accent-series" events={sections.series} omitCovers={omitCovers} />
      <StaticMediaGroup title="Anime" accentClass="fh-accent-anime" events={sections.anime} omitCovers={omitCovers} />
      <StaticMediaGroup
        title="Reality"
        accentClass="fh-accent-tv"
        events={sections.tvReality}
        omitCovers={omitCovers}
      />
      <StaticMediaGroup
        title="Concursos"
        accentClass="fh-accent-tv"
        events={sections.tvConcurso}
        omitCovers={omitCovers}
      />
      <StaticMediaGroup
        title="Directos"
        accentClass="fh-accent-tv"
        events={sections.tvDirecto}
        omitCovers={omitCovers}
      />
    </>
  );
}
