import type { EventRow } from "./types";
import { buildWeekDestacadosPresentation } from "../lib/destacados-week-present";
import { FEED_DAY_COUNT } from "../lib/events-feed";
import { buildDisplayDays, MADRID_TZ } from "../lib/timezone";
import { ChampionsWeekHero } from "./ChampionsWeekHero";
import { DestacadosStaticRow } from "./DestacadosStaticRow";
import { UfcFighterFlank, UfcWeekHero } from "./UfcWeekHero";

type Props = {
  events: EventRow[];
};

export function DestacadosSection({ events }: Props) {
  const todayKey = buildDisplayDays(MADRID_TZ, FEED_DAY_COUNT)[0]?.date ?? "";
  const presentation = buildWeekDestacadosPresentation(
    events,
    todayKey,
    FEED_DAY_COUNT
  );
  const { hero, weekFeatured, subtitle, destacadosClassSuffix } = presentation;

  if (weekFeatured.length === 0 && !hero) return null;

  const rowProps = {
    title: "Esta semana",
    subtitle,
    items: weekFeatured,
    ariaLabel: "Destacados de la semana",
    className: `qvh-destacados-week qvh-destacados-week-first${destacadosClassSuffix}`,
  };

  return (
    <div className="qvh-destacados-stack">
      {hero?.type === "ufc" ? (
        <div className="qvh-ufc-week-shell">
          <UfcWeekHero context={hero.context} />
          {weekFeatured.length > 0 ? (
            <div className="qvh-ufc-week-panel">
              <UfcFighterFlank
                src={hero.context.fighter1Image}
                name={hero.context.fighter1}
                align="left"
              />
              <DestacadosStaticRow {...rowProps} />
              <UfcFighterFlank
                src={hero.context.fighter2Image}
                name={hero.context.fighter2}
                align="right"
              />
            </div>
          ) : null}
        </div>
      ) : hero?.type === "champions" ? (
        <div className="qvh-cl-week-shell">
          <ChampionsWeekHero context={hero.context} />
          {weekFeatured.length > 0 ? (
            <DestacadosStaticRow {...rowProps} />
          ) : null}
        </div>
      ) : (
        <DestacadosStaticRow {...rowProps} />
      )}
    </div>
  );
}
