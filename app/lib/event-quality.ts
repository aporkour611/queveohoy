/** Nombres de equipo no publicables (TBD, ganador de semifinal, etc.). */
const PLACEHOLDER_TEAM =
  /^(tbd|tbc|tba|t\.?\s*b\.?\s*d\.?|to be determined|to be confirmed|to be announced|por determinar|por confirmar|a determinar|a confirmar|unknown|n\/a|\?+|[-—]+)$/i;

const PLACEHOLDER_PREFIX =
  /^(winner|loser|winners|losers|ganador|perdedor|equipo\s+\d+|team\s+\d+|match\s+\d+\s+winner|match\s+\d+\s+loser)\b/i;

export function isPlaceholderTeamName(name?: string | null): boolean {
  const trimmed = name?.trim();
  if (!trimmed) return true;
  if (PLACEHOLDER_TEAM.test(trimmed)) return true;
  if (PLACEHOLDER_PREFIX.test(trimmed)) return true;
  return false;
}

function parseVersusTeams(title: string): [string, string] | null {
  const match = title.match(/^(.+?)\s+vs\.?\s+(.+)$/i);
  if (!match) return null;
  return [match[1].trim(), match[2].trim()];
}

type TeamEventFields = {
  title?: string | null;
  home_team?: string | null;
  away_team?: string | null;
  sport?: string | null;
};

function isSoloCompetitionSport(sport?: string | null): boolean {
  return sport === "ciclismo" || sport === "formula1" || sport === "motos";
}

/** Partido con al menos un equipo sin confirmar. */
export function eventHasPlaceholderTeams(
  event: TeamEventFields
): boolean {
  if (isSoloCompetitionSport(event.sport)) return false;
  const home = event.home_team?.trim();
  const away = event.away_team?.trim();

  if (home || away) {
    return isPlaceholderTeamName(home) || isPlaceholderTeamName(away);
  }

  const parsed = event.title ? parseVersusTeams(event.title) : null;
  if (!parsed) return false;

  return isPlaceholderTeamName(parsed[0]) || isPlaceholderTeamName(parsed[1]);
}

/** Evento apto para guardar o mostrar (equipos confirmados). */
export function isPublishableTeamEvent(event: TeamEventFields): boolean {
  const sport = event.sport ?? "";
  const teamSports = new Set([
    "futbol",
    "basket",
    "tenis",
    "csgo",
    "valorant",
    "lol",
    "dota2",
  ]);

  if (!teamSports.has(sport)) return true;
  return !eventHasPlaceholderTeams(event);
}
