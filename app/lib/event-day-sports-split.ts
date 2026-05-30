import type { EventDayGroups } from "./event-day-group";

export const MOTOR_SPORT_IDS = new Set(["formula1", "motos", "rally"]);
export const ESPORTS_SPORT_IDS = new Set(["csgo", "valorant", "lol"]);

type SportEntry = EventDayGroups["bySport"][string];

export function splitMotorFromSportsEsports(bySport: EventDayGroups["bySport"]): {
  motor: EventDayGroups["bySport"];
  sportsEsports: EventDayGroups["bySport"];
} {
  const motor: EventDayGroups["bySport"] = {};
  const sportsEsports: EventDayGroups["bySport"] = {};

  for (const [sportId, entry] of Object.entries(bySport)) {
    if (MOTOR_SPORT_IDS.has(sportId)) {
      motor[sportId] = entry;
    } else {
      sportsEsports[sportId] = entry;
    }
  }

  return { motor, sportsEsports };
}

/** Deportes tradicionales primero; e-sports al final del bloque global. */
export function sortSportsEsportsEntries(
  bySport: EventDayGroups["bySport"]
): SportEntry[] {
  return Object.values(bySport).sort((a, b) => {
    const aEsports = ESPORTS_SPORT_IDS.has(a.sportId);
    const bEsports = ESPORTS_SPORT_IDS.has(b.sportId);
    if (aEsports !== bEsports) return aEsports ? 1 : -1;
    return a.label.localeCompare(b.label, "es");
  });
}

export function hasSportsEsportsContent(
  football: EventDayGroups["football"],
  sportsEsports: EventDayGroups["bySport"]
): boolean {
  const hasFootball = Object.values(football).some((events) => events.length > 0);
  const hasOther = Object.values(sportsEsports).some((entry) => entry.events.length > 0);
  return hasFootball || hasOther;
}
