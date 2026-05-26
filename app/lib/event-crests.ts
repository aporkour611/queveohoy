import type { EventRow } from "../components/types";
import { sportFilterGroupId } from "./filter-config";
import { parseEsportsTeamLogos, isEsportsSport } from "./esports";
import { parseFootballTeamIds } from "./football";

const TEAM_CREST_SPORTS = new Set([
  "futbol",
  "csgo",
  "valorant",
  "lol",
  "dota2",
]);

export function isTeamCrestSport(sport?: string | null): boolean {
  return !!sport && TEAM_CREST_SPORTS.has(sport);
}

/** Partidos con dos equipos: exigen escudo/logo en ambos lados */
export function eventHasTeamCrests(e: EventRow): boolean {
  const sport = e.sport ?? "";

  if (!TEAM_CREST_SPORTS.has(sport)) return true;

  if (sport === "futbol") {
    return (
      parseFootballTeamIds(
        e.external_id,
        e.source,
        e.home_team,
        e.away_team
      ) !== null
    );
  }

  if (isEsportsSport(sport)) {
    const logos = parseEsportsTeamLogos(e.source);
    return Boolean(logos?.homeUrl && logos?.awayUrl);
  }

  return true;
}

/** Oculta partidos de equipo sin escudos/logos en toda la app */
export function filterEventsWithCrests<T extends EventRow>(events: T[]): T[] {
  return events.filter(eventHasTeamCrests);
}
