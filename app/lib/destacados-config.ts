import type { EventRow } from "../components/types";
import { parseFootballTeamIds } from "./football";
import { getMadridWeekDates } from "./madrid-time";

export type DestacadoRule = {
  id: string;
  externalId?: string | RegExp;
  /** IDs football-data.org; local/visitante indiferente */
  teamIds?: [string, string];
  teams?: { a: RegExp; b: RegExp };
};

/** Destacados editoriales — añade entradas aquí en el orden deseado */
export const DESTACADOS_RULES: DestacadoRule[] = [
  {
    id: "psg-arsenal",
    teamIds: ["524", "57"],
  },
];

function matchesRule(event: EventRow, rule: DestacadoRule): boolean {
  if (rule.externalId) {
    const id = event.external_id ?? "";
    return typeof rule.externalId === "string"
      ? id === rule.externalId
      : rule.externalId.test(id);
  }

  if (rule.teamIds) {
    const ids = parseFootballTeamIds(
      event.external_id,
      event.source,
      event.home_team,
      event.away_team
    );
    if (!ids) return false;
    const [a, b] = rule.teamIds;
    return (
      (ids.homeId === a && ids.awayId === b) ||
      (ids.homeId === b && ids.awayId === a)
    );
  }

  if (rule.teams) {
    const home = (event.home_team ?? "").toLowerCase();
    const away = (event.away_team ?? "").toLowerCase();
    const { a, b } = rule.teams;
    return (
      (a.test(home) && b.test(away)) || (a.test(away) && b.test(home))
    );
  }

  return false;
}

/** Eventos curados para la franja Destacados (orden = DESTACADOS_RULES) */
export function pickCuratedDestacados(
  events: EventRow[],
  windowDays = 7
): EventRow[] {
  const week = new Set(getMadridWeekDates(windowDays));
  const inWindow = events.filter((e) => e.date && week.has(e.date));
  const picked: EventRow[] = [];
  const seen = new Set<number>();

  for (const rule of DESTACADOS_RULES) {
    const match = inWindow.find((e) => matchesRule(e, rule));
    if (match && !seen.has(match.id)) {
      seen.add(match.id);
      picked.push(match);
    }
  }

  return picked.sort(
    (a, b) =>
      (a.date ?? "").localeCompare(b.date ?? "") ||
      (a.time ?? "").localeCompare(b.time ?? "")
  );
}
