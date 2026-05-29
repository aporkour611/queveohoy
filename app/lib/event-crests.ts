import type { EventRow } from "../components/types";
import { parseBasketTeamLogos } from "./basketball";
import { isBlockedSport } from "./blocked-sports";
import { isImportantEvent } from "./featured";
import { eventHasPlaceholderTeams } from "./event-quality";
import { parseEsportsTeamLogos, isEsportsSport } from "./esports";
import { parseFootballTeamIds } from "./football";

const TEAM_CREST_SPORTS = new Set([
  "futbol",
  "basket",
  "csgo",
  "valorant",
  "lol",
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

  if (sport === "basket") {
    const logos = parseBasketTeamLogos(e.source, e.home_team, e.away_team);
    return Boolean(logos?.homeUrl && logos?.awayUrl);
  }

  return true;
}

/** Visible en la app: equipos confirmados, escudos completos o evento importante */
export function eventCanDisplay(e: EventRow): boolean {
  if (isBlockedSport(e.sport)) return false;
  if (eventHasPlaceholderTeams(e)) return false;
  if (!isTeamCrestSport(e.sport ?? "")) return true;
  if (eventHasTeamCrests(e)) return true;
  return isImportantEvent(e);
}

/** Oculta partidos de equipo sin escudos, salvo eventos importantes */
export function filterEventsForDisplay<T extends EventRow>(events: T[]): T[] {
  return events.filter(eventCanDisplay);
}
