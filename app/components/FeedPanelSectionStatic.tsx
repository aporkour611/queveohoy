import { CategoryIcon } from "./CategoryIcon";
import { FeedSectionHero } from "./FeedSectionHero";
import { MatchCardStatic } from "./MatchCardStatic";
import { sortEventsByPopularity } from "../lib/sort-events-by-priority";
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
import {
  FEED_PANEL_CONFIG,
  type FeedPanelSectionProps,
  type FeedPanelSubgroup,
  type FeedPanelVariant,
} from "../lib/feed-panel-config";

export type { FeedPanelVariant, FeedPanelSubgroup };

type Props = FeedPanelSectionProps & {
  omitCovers?: boolean;
};

function StaticPanelSubgroup({
  label,
  iconId,
  accentClass,
  events,
  shellClassName,
  omitCovers = false,
}: Omit<FeedPanelSubgroup, "key" | "cardLayout"> & { omitCovers?: boolean }) {
  const sortedEvents = sortEventsByPopularity(events);
  if (sortedEvents.length === 0) return null;

  const blockClass = ["qvh-feed-group", shellClassName, accentClass]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={blockClass}>
      <div className="qvh-feed-group-head">
        <CategoryIcon id={iconId} size={20} className="qvh-feed-group-icon" />
        <h4 className="qvh-feed-group-title">{label}</h4>
        <span className="qvh-feed-group-count">{sortedEvents.length}</span>
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

export function FeedPanelSectionStatic({
  panel,
  football = {},
  bySport = {},
  subgroups,
  titleOverride,
  leadOverride,
  ariaLabelOverride,
  omitCovers = false,
}: Props) {
  const config = FEED_PANEL_CONFIG[panel];
  const blocks =
    subgroups ?? buildSportSubgroups(panel, football, bySport);

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

      {blocks.map(({ key, ...block }) => (
        <StaticPanelSubgroup
          key={key}
          {...block}
          omitCovers={omitCovers}
        />
      ))}
    </section>
  );
}
