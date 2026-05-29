import type { EventRow } from "./types";
import { pickWeekDestacados } from "../lib/destacados-config";
import { resolveChampionsWeekContext } from "../lib/champions-week";
import { FEED_DAY_COUNT } from "../lib/events-feed";
import { buildDisplayDays, MADRID_TZ } from "../lib/timezone";
import { ChampionsWeekHero } from "./ChampionsWeekHero";
import { DestacadosStaticRow } from "./DestacadosStaticRow";
import { DestacadosEnhancerSlot } from "./DestacadosEnhancerSlot";

type Props = {
  events: EventRow[];
};

export function DestacadosSection({ events }: Props) {
  const todayKey = buildDisplayDays(MADRID_TZ, FEED_DAY_COUNT)[0]?.date ?? "";
  const weekFeatured = pickWeekDestacados(events, { todayKey });
  const championsWeek = resolveChampionsWeekContext(
    events,
    todayKey,
    FEED_DAY_COUNT
  );

  if (weekFeatured.length === 0) return null;

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
          <DestacadosStaticRow {...rowProps} />
          <DestacadosEnhancerSlot {...rowProps} />
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
