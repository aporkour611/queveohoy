import type { EventDayGroups } from "./event-day-group";

export const MOTOR_SPORT_IDS = new Set(["formula1", "motos", "rally"]);
export const ESPORTS_SPORT_IDS = new Set(["csgo", "valorant", "lol"]);

const MOTOR_SORT_ORDER = ["formula1", "motos", "rally"];

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

export function splitSportsFromEsports(bySport: EventDayGroups["bySport"]): {
  sports: EventDayGroups["bySport"];
  esports: EventDayGroups["bySport"];
} {
  const sports: EventDayGroups["bySport"] = {};
  const esports: EventDayGroups["bySport"] = {};

  for (const [sportId, entry] of Object.entries(bySport)) {
    if (ESPORTS_SPORT_IDS.has(sportId)) {
      esports[sportId] = entry;
    } else {
      sports[sportId] = entry;
    }
  }

  return { sports, esports };
}

export function sortSportEntries(bySport: EventDayGroups["bySport"]): SportEntry[] {
  return Object.values(bySport).sort((a, b) =>
    a.label.localeCompare(b.label, "es")
  );
}

export function sortEsportsEntries(bySport: EventDayGroups["bySport"]): SportEntry[] {
  return Object.values(bySport).sort((a, b) =>
    a.label.localeCompare(b.label, "es")
  );
}

export function sortMotorEntries(bySport: EventDayGroups["bySport"]): SportEntry[] {
  return Object.values(bySport).sort(
    (a, b) =>
      MOTOR_SORT_ORDER.indexOf(a.sportId) - MOTOR_SORT_ORDER.indexOf(b.sportId)
  );
}

/** @deprecated Usar sortSportEntries + sortEsportsEntries por panel */
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

export function hasFootballContent(football: EventDayGroups["football"]): boolean {
  return Object.values(football).some((events) => events.length > 0);
}

export function hasBySportContent(bySport: EventDayGroups["bySport"]): boolean {
  return Object.values(bySport).some((entry) => entry.events.length > 0);
}
