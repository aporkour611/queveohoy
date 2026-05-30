import { sportAccentClass } from "../lib/sport-accent";
import { groupEventsForDisplay } from "../lib/event-day-group";
import { splitMotorFromSportsEsports } from "../lib/event-day-sports-split";
import { sortEventsByPopularity } from "../lib/sort-events-by-priority";
import type { EventRow } from "./types";
import { MatchCardStatic } from "./MatchCardStatic";
import { CategorySectionHeader } from "./CategorySectionHeader";
import { SportsEsportsFeedSectionStatic } from "./SportsEsportsFeedSectionStatic";

type Props = {
  events: EventRow[];
  emptyMessage?: string;
  /** Sin pósters en tarjetas (SSR home: protege LCP de destacados). */
  omitCovers?: boolean;
};

function StaticMotorBlock({
  title,
  accentClass,
  events,
  omitCovers = false,
  iconId,
}: {
  title: string;
  accentClass: string;
  events: EventRow[];
  omitCovers?: boolean;
  iconId: string;
}) {
  const sortedEvents = sortEventsByPopularity(events);
  if (sortedEvents.length === 0) return null;

  return (
    <div className="fh-section-block qvh-feed-category-shell qvh-content-auto">
      <div className={`fh-comp-header ${accentClass}`}>
        <CategorySectionHeader
          title={title}
          iconId={iconId}
          count={events.length}
        />
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
  iconId,
}: {
  title: string;
  accentClass: string;
  events: EventRow[];
  omitCovers?: boolean;
  iconId: string;
}) {
  if (events.length === 0) return null;
  return (
    <StaticMotorBlock
      title={title}
      accentClass={accentClass}
      events={events}
      omitCovers={omitCovers}
      iconId={iconId}
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
  const { motor, sportsEsports } = splitMotorFromSportsEsports(sections.bySport);

  return (
    <>
      <SportsEsportsFeedSectionStatic
        football={sections.football}
        sportsEsports={sportsEsports}
        omitCovers={omitCovers}
      />

      {Object.values(motor).map(({ label, sportId, events: evs }) => (
        <StaticMotorBlock
          key={sportId}
          title={label}
          iconId={sportId}
          accentClass={sportAccentClass(sportId)}
          events={evs}
          omitCovers={omitCovers}
        />
      ))}

      <StaticMediaGroup title="Cine" accentClass="fh-accent-cine" events={sections.cine} omitCovers={omitCovers} iconId="cine" />
      <StaticMediaGroup title="Series" accentClass="fh-accent-series" events={sections.series} omitCovers={omitCovers} iconId="series" />
      <StaticMediaGroup title="Anime" accentClass="fh-accent-anime" events={sections.anime} omitCovers={omitCovers} iconId="anime" />
      <StaticMediaGroup
        title="Reality"
        accentClass="fh-accent-tv"
        events={sections.tvReality}
        omitCovers={omitCovers}
        iconId="tv-reality"
      />
      <StaticMediaGroup
        title="Concursos"
        accentClass="fh-accent-tv"
        events={sections.tvConcurso}
        omitCovers={omitCovers}
        iconId="tv-concurso"
      />
      <StaticMediaGroup
        title="Directos"
        accentClass="fh-accent-tv"
        events={sections.tvDirecto}
        omitCovers={omitCovers}
        iconId="tv-directo"
      />
    </>
  );
}
