import type { EventRow } from "./types";
import { pickWeekDestacados } from "../lib/destacados-config";
import { resolveChampionsWeekContext } from "../lib/champions-week";
import { FEED_DAY_COUNT } from "../lib/events-feed";
import {
  getSpotlightCardModel,
  spotlightHasCompleteTeamCover,
} from "../lib/featured-card";
import { buildDisplayDays, MADRID_TZ } from "../lib/timezone";
import { ChampionsWeekHero } from "./ChampionsWeekHero";
import { DestacadosStaticRow } from "./DestacadosStaticRow";
import { DestacadosEnhancerSlot } from "./DestacadosEnhancerSlot";

type Props = {
  events: EventRow[];
};

export function DestacadosSection({ events }: Props) {
  const todayKey = buildDisplayDays(MADRID_TZ, FEED_DAY_COUNT)[0]?.date ?? "";
  const championsWeek = resolveChampionsWeekContext(
    events,
    todayKey,
    FEED_DAY_COUNT
  );
  const championsFinalId = championsWeek?.finalEvent.id;

  const weekFeatured = pickWeekDestacados(events, { todayKey }).filter((event) => {
    if (championsFinalId != null && event.id === championsFinalId) return true;
    return spotlightHasCompleteTeamCover(getSpotlightCardModel(event, MADRID_TZ));
  });

  if (weekFeatured.length === 0 && !championsWeek) return null;

  const subtitle = championsWeek
    ? "La gran final y lo más esperado del fin de semana"
    : "Estrenos, finales y series que marcan la semana";

  const rowProps = {
    title: "Esta semana",
    subtitle,
    items: weekFeatured,
    ariaLabel: "Destacados de la semana",
    className: `qvh-destacados-week qvh-destacados-week-first${
      championsWeek ? " qvh-cl-week-destacados" : ""
    }`,
  };

  return (
    <div className="qvh-destacados-stack">
      {championsWeek ? (
        <div className="qvh-cl-week-shell">
          <ChampionsWeekHero context={championsWeek} />
          {weekFeatured.length > 0 ? (
            <>
              <DestacadosStaticRow {...rowProps} />
              <DestacadosEnhancerSlot {...rowProps} />
            </>
          ) : null}
        </div>
      ) : (
        <>
          <DestacadosStaticRow {...rowProps} />
          <DestacadosEnhancerSlot {...rowProps} />
        </>
      )}
    </div>
  );
}
