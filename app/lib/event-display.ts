import type { EventRow } from "../components/types";
import { sportLabel } from "./filter-config";

/** Deportes que son una prueba/carrera, no un duelo entre dos equipos. */
const SOLO_COMPETITION_SPORTS = new Set([
  "ciclismo",
  "formula1",
  "motos",
]);

export function isSoloCompetitionSport(sport?: string | null): boolean {
  return !!sport && SOLO_COMPETITION_SPORTS.has(sport);
}

/** Partido o duelo con dos equipos/jugadores enfrentados. */
export function isTeamVersusEvent(
  event: Pick<EventRow, "sport" | "home_team" | "away_team">
): boolean {
  if (isSoloCompetitionSport(event.sport)) return false;
  return Boolean(event.home_team?.trim() && event.away_team?.trim());
}

export function eventDisplayTitle(event: EventRow): string {
  if (isTeamVersusEvent(event)) {
    const home = event.home_team?.trim();
    const away = event.away_team?.trim();
    if (home && away) return `${home} vs ${away}`;
  }
  return event.title?.trim() || sportLabel(event.sport ?? "") || "Evento";
}

export function eventVersusTeams(event: EventRow): {
  home: string;
  away: string;
} | null {
  if (!isTeamVersusEvent(event)) return null;
  return {
    home: event.home_team?.trim() || "",
    away: event.away_team?.trim() || "",
  };
}
