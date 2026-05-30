import type { EventRow } from "./types";
import { CategoryIcon } from "./CategoryIcon";
import { FeedSectionHero } from "./FeedSectionHero";
import { MatchCardStatic } from "./MatchCardStatic";
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
  omitCovers?: boolean;
};

function StaticSportsSubgroup({
  label,
  iconId,
  accentClass,
  events,
  shellClassName,
  omitCovers = false,
}: {
  label: string;
  iconId: string;
  accentClass?: string;
  events: EventRow[];
  shellClassName?: string;
  omitCovers?: boolean;
}) {
  const sortedEvents = sortEventsByPopularity(events);
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

export function SportsEsportsFeedSectionStatic({
  football,
  sportsEsports,
  omitCovers = false,
}: Props) {
  const sportEntries = sortSportsEsportsEntries(sportsEsports);
  const footballEntries = Object.entries(football);

  const hasContent =
    footballEntries.some(([, evs]) => evs.length > 0) ||
    sportEntries.some((entry) => entry.events.length > 0);

  if (!hasContent) return null;

  return (
    <section className="qvh-sports-section" aria-label="Deportes y E-Sports">
      <FeedSectionHero
        variant="sports"
        eyebrow="Deportes"
        title="Deportes y E-Sports"
        lead="Fútbol, tenis, baloncesto, UFC, CS2, Valorant y LoL con horario y canal en España"
      />

      {footballEntries.map(([comp, evs]) => {
        if (evs.length === 0) return null;
        const isClWeekBlock =
          isChampionsCompetitionTitle(comp) &&
          evs.some((event) => isChampionsFinal(event));
        return (
          <StaticSportsSubgroup
            key={comp}
            label={comp}
            iconId="futbol"
            accentClass={competitionAccentClass(comp)}
            events={evs}
            shellClassName={isClWeekBlock ? "qvh-cl-week-feed-block" : undefined}
            omitCovers={omitCovers}
          />
        );
      })}

      {sportEntries.map(({ label, sportId, events: evs }) => (
        <StaticSportsSubgroup
          key={sportId}
          label={label}
          iconId={sportId}
          accentClass={sportAccentClass(sportId)}
          events={evs}
          omitCovers={omitCovers}
        />
      ))}
    </section>
  );
}
