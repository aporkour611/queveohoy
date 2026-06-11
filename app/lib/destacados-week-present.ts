import type { EventRow } from "../components/types";
import { pickWeekDestacados } from "./destacados-config";
import {
  getSpotlightCardModel,
  spotlightHasCompleteTeamCover,
} from "./featured-card";
import { MADRID_TZ } from "./timezone";
import { resolvePrimaryWeekHeroContext, type WeekHeroContext } from "./week-hero";

export type WeekDestacadosPresentation = {
  hero: WeekHeroContext | null;
  weekFeatured: EventRow[];
  subtitle: string;
  destacadosClassSuffix: string;
  bodyClassSuffix: string;
};

export function buildWeekDestacadosPresentation(
  weekEvents: EventRow[],
  todayKey: string,
  windowDays: number
): WeekDestacadosPresentation {
  const hero = resolvePrimaryWeekHeroContext(weekEvents, todayKey, windowDays);

  const weekFeatured = pickWeekDestacados(weekEvents, { todayKey }).filter(
    (event) => {
      if (hero?.type === "ufc" && event.id === hero.context.mainEvent.id) {
        return false;
      }
      if (
        hero?.type === "champions" &&
        event.id === hero.context.finalEvent.id
      ) {
        return true;
      }
      return spotlightHasCompleteTeamCover(
        getSpotlightCardModel(event, MADRID_TZ)
      );
    }
  );

  const subtitle =
    hero?.type === "ufc"
      ? "La pelea del año en Casablanca y lo más esperado de la semana"
      : hero?.type === "champions"
        ? "La gran final y lo más esperado del fin de semana"
        : "Estrenos, finales y series que marcan la semana";

  const destacadosClassSuffix =
    hero?.type === "ufc"
      ? " qvh-ufc-week-destacados"
      : hero?.type === "champions"
        ? " qvh-cl-week-destacados"
        : "";

  const bodyClassSuffix = hero?.type === "ufc" ? " qvh-ufc-week-site" : "";

  return {
    hero,
    weekFeatured,
    subtitle,
    destacadosClassSuffix,
    bodyClassSuffix,
  };
}
