import { eventHasPlaceholderTeams, isPlaceholderTeamName } from "./event-quality";
import { isBlockedSport } from "./blocked-sports";

export type PandascoreMatchMeta = {
  league?: { name?: string | null; tier?: string | null } | null;
  serie?: { full_name?: string | null; tier?: string | null } | null;
  tournament?: { name?: string | null; tier?: string | null } | null;
  opponents?: Array<{ opponent?: { name?: string | null } | null }> | null;
};

export const PANDASCORE_ESPORTS_GAMES = [
  { slug: "cs-go", sport: "csgo" },
  { slug: "valorant", sport: "valorant" },
  { slug: "league-of-legends", sport: "lol" },
] as const;

export const PANDASCORE_PER_PAGE = 100;
/** Tope de seguridad por juego (100 × 10 = 1000 partidos / semana). */
export const PANDASCORE_MAX_PAGES = 10;

const ESPORTS_SPORTS = new Set(["csgo", "valorant", "lol"]);

function opponentsConfirmed(match: PandascoreMatchMeta): boolean {
  const names = (match.opponents ?? [])
    .map((o) => o.opponent?.name?.trim())
    .filter(Boolean) as string[];

  if (names.length < 2) return false;
  return names.every((name) => !isPlaceholderTeamName(name));
}

/** Ingesta: solo exige dos equipos confirmados (sin filtrar por tier o liga). */
export function isValidPandascoreMatchForImport(match: PandascoreMatchMeta): boolean {
  return opponentsConfirmed(match);
}

export function pandascoreMatchCompetition(match: PandascoreMatchMeta): string {
  return (
    match.league?.name?.trim() ||
    match.serie?.full_name?.trim() ||
    match.tournament?.name?.trim() ||
    "E-Sports"
  );
}

/** @deprecated Usar isValidPandascoreMatchForImport */
export function shouldIngestPandascoreMatch(match: PandascoreMatchMeta): boolean {
  return isValidPandascoreMatchForImport(match);
}

/** Solo purga placeholders o deportes bloqueados; no por liga menor. */
export function shouldPurgeStoredEsportsEvent(event: {
  sport?: string | null;
  competition?: string | null;
  title?: string | null;
  home_team?: string | null;
  away_team?: string | null;
}): boolean {
  const sport = event.sport ?? "";
  if (isBlockedSport(sport)) return true;
  if (!ESPORTS_SPORTS.has(sport)) return false;
  return eventHasPlaceholderTeams(event);
}
