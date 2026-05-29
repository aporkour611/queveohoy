import { normalizeRemoteImageUrl } from "./remote-image";

const LOGO_PREFIX = "bdl-logos:";

/** Abreviaturas NBA oficiales por nombre de equipo (Balldontlie / legacy). */
const NBA_ABBR_BY_NAME: Record<string, string> = {
  "atlanta hawks": "ATL",
  "boston celtics": "BOS",
  "brooklyn nets": "BKN",
  "charlotte hornets": "CHA",
  "chicago bulls": "CHI",
  "cleveland cavaliers": "CLE",
  "dallas mavericks": "DAL",
  "denver nuggets": "DEN",
  "detroit pistons": "DET",
  "golden state warriors": "GSW",
  "houston rockets": "HOU",
  "indiana pacers": "IND",
  "la clippers": "LAC",
  "los angeles clippers": "LAC",
  "la lakers": "LAL",
  "los angeles lakers": "LAL",
  "memphis grizzlies": "MEM",
  "miami heat": "MIA",
  "milwaukee bucks": "MIL",
  "minnesota timberwolves": "MIN",
  "new orleans pelicans": "NOP",
  "new york knicks": "NYK",
  "oklahoma city thunder": "OKC",
  "orlando magic": "ORL",
  "philadelphia 76ers": "PHI",
  "phoenix suns": "PHX",
  "portland trail blazers": "POR",
  "sacramento kings": "SAC",
  "san antonio spurs": "SAS",
  "toronto raptors": "TOR",
  "utah jazz": "UTA",
  "washington wizards": "WAS",
};

export function nbaAbbrFromTeamName(name?: string | null): string | null {
  if (!name?.trim()) return null;
  const key = name.trim().toLowerCase();
  if (NBA_ABBR_BY_NAME[key]) return NBA_ABBR_BY_NAME[key];

  for (const [pattern, abbr] of Object.entries(NBA_ABBR_BY_NAME)) {
    if (key.includes(pattern) || pattern.includes(key)) return abbr;
  }

  return null;
}

export function encodeBasketSource(homeAbbr: string, awayAbbr: string): string {
  const home = homeAbbr.trim().toUpperCase();
  const away = awayAbbr.trim().toUpperCase();
  return `${LOGO_PREFIX}${home}::${away}`;
}

export function basketTeamLogoUrl(abbr: string): string {
  return `https://a.espncdn.com/i/teamlogos/nba/500/${abbr.trim().toLowerCase()}.png`;
}

export function basketLogoFallbackUrls(abbr: string): string[] {
  const lower = abbr.trim().toLowerCase();
  const seen = new Set<string>();
  const out: string[] = [];

  for (const url of [
    basketTeamLogoUrl(lower),
    `https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/${lower}.png`,
    `https://a.espncdn.com/i/teamlogos/nba/500/dark/${lower}.png`,
  ]) {
    const normalized = normalizeRemoteImageUrl(url);
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    out.push(normalized);
  }

  return out;
}

export function parseBasketTeamLogos(
  source?: string | null,
  homeTeam?: string | null,
  awayTeam?: string | null
): {
  homeUrl: string | null;
  awayUrl: string | null;
  homeAbbr: string | null;
  awayAbbr: string | null;
} | null {
  if (source?.startsWith(LOGO_PREFIX)) {
    const rest = source.slice(LOGO_PREFIX.length);
    const sep = rest.indexOf("::");
    if (sep === -1) return null;

    const homeAbbr = rest.slice(0, sep).trim().toUpperCase();
    const awayAbbr = rest.slice(sep + 2).trim().toUpperCase();
    if (!homeAbbr || !awayAbbr) return null;

    return {
      homeAbbr,
      awayAbbr,
      homeUrl: basketTeamLogoUrl(homeAbbr),
      awayUrl: basketTeamLogoUrl(awayAbbr),
    };
  }

  const legacy = source?.match(/^bdl:(.+):(.+)$/);
  const homeAbbr =
    nbaAbbrFromTeamName(legacy?.[1] ?? homeTeam) ??
    (legacy?.[1]?.trim().length === 3 ? legacy[1].trim().toUpperCase() : null);
  const awayAbbr =
    nbaAbbrFromTeamName(legacy?.[2] ?? awayTeam) ??
    (legacy?.[2]?.trim().length === 3 ? legacy[2].trim().toUpperCase() : null);

  if (!homeAbbr || !awayAbbr) return null;

  return {
    homeAbbr,
    awayAbbr,
    homeUrl: basketTeamLogoUrl(homeAbbr),
    awayUrl: basketTeamLogoUrl(awayAbbr),
  };
}
