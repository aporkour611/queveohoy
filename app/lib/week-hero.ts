import type { ChampionsWeekContext } from "./champions-week";
import { resolveChampionsWeekContext } from "./champions-week";
import type { UfcWeekContext } from "./ufc-week";
import { resolveUfcWeekContext } from "./ufc-week";
import type { EventRow } from "../components/types";

export type WeekHeroContext =
  | { type: "ufc"; context: UfcWeekContext }
  | { type: "champions"; context: ChampionsWeekContext };

/** Hero semanal: UFC Casablanca tiene prioridad sobre Champions. */
export function resolvePrimaryWeekHeroContext(
  events: EventRow[],
  todayKey: string,
  windowDays = 7
): WeekHeroContext | null {
  const ufcWeek = resolveUfcWeekContext(events, todayKey, windowDays);
  if (ufcWeek) return { type: "ufc", context: ufcWeek };

  const championsWeek = resolveChampionsWeekContext(
    events,
    todayKey,
    windowDays
  );
  if (championsWeek) return { type: "champions", context: championsWeek };

  return null;
}
