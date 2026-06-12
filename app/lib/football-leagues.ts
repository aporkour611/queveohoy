/**
 * Registro central de ligas de fútbol (ingesta, estilo, canales, SEO).
 * Añadir una liga = una entrada aquí + hub opcional en seo-hubs.ts.
 */
export type FootballLeagueConfig = {
  /** Código football-data.org v4 */
  code: string
  label: string
  match: RegExp
  cssClass: string
  defaultChannels: string
  priority: number
}

export const FOOTBALL_LEAGUES: FootballLeagueConfig[] = [
  {
    code: "SD",
    label: "LaLiga Hypermotion",
    match: /segunda|hypermotion|primera\s*federaci/i,
    cssClass: "fh-match_segunda",
    defaultChannels: "DAZN LaLiga TV Hypermotion, Movistar+",
    priority: 72,
  },
  {
    code: "PD",
    label: "LaLiga EA Sports",
    match: /laliga|primera\s*divisi|division\s*de\s*honor/i,
    cssClass: "fh-match_laliga",
    defaultChannels: "Movistar+, DAZN LaLiga",
    priority: 85,
  },
  {
    code: "CL",
    label: "Champions League",
    match: /champions\s*league|uefa\s*champions/i,
    cssClass: "fh-match_championsleague",
    defaultChannels: "La 1, RTVE Play, M+ Liga de Campeones",
    priority: 100,
  },
  {
    code: "EL",
    label: "Europa League",
    match: /europa\s*league/i,
    cssClass: "fh-match_europa",
    defaultChannels: "Movistar+, DAZN",
    priority: 92,
  },
  {
    code: "ECL",
    label: "Conference League",
    match: /conference\s*league/i,
    cssClass: "fh-match_europa",
    defaultChannels: "Movistar+, DAZN",
    priority: 88,
  },
  {
    code: "CDR",
    label: "Copa del Rey",
    match: /copa del rey/i,
    cssClass: "fh-match_copadelrey",
    defaultChannels: "Movistar+, DAZN, RTVE",
    priority: 83,
  },
  {
    code: "PL",
    label: "Premier League",
    match: /premier\s*league/i,
    cssClass: "fh-match_premierleague",
    defaultChannels: "Sky Sports, Vamos, DAZN",
    priority: 84,
  },
  {
    code: "BL1",
    label: "Bundesliga",
    match: /bundesliga/i,
    cssClass: "fh-match_bundesliga",
    defaultChannels: "DAZN, Movistar+",
    priority: 82,
  },
  {
    code: "SA",
    label: "Serie A",
    match: /serie\s*a/i,
    cssClass: "fh-match_seriea",
    defaultChannels: "Movistar+, DAZN",
    priority: 81,
  },
  {
    code: "FL1",
    label: "Ligue 1",
    match: /ligue\s*1/i,
    cssClass: "fh-match_ligue1",
    defaultChannels: "Movistar+, DAZN",
    priority: 80,
  },
  {
    code: "DED",
    label: "Eredivisie",
    match: /eredivisie/i,
    cssClass: "fh-match_eredivisie",
    defaultChannels: "ESPN, Movistar+",
    priority: 76,
  },
  {
    code: "PPL",
    label: "Primeira Liga",
    match: /primeira\s*liga|liga\s*portugal/i,
    cssClass: "fh-match_ligue1",
    defaultChannels: "Movistar+, DAZN",
    priority: 75,
  },
  {
    code: "WC",
    label: "Mundial",
    match: /world\s*cup|mundial/i,
    cssClass: "fh-match_championsleague",
    defaultChannels: "RTVE, La 1, DAZN, Movistar+",
    priority: 100,
  },
]

/** Códigos para cron (football-data.org). */
export const FOOTBALL_DATA_CODES = [
  ...new Set(FOOTBALL_LEAGUES.map((league) => league.code)),
]

export function resolveFootballLeague(
  competition?: string | null
): FootballLeagueConfig | undefined {
  const text = competition ?? ""
  if (!text.trim()) return undefined
  return FOOTBALL_LEAGUES.find((league) => league.match.test(text))
}

export function defaultChannelsForFootballCompetition(
  competition?: string | null
): string {
  const league = resolveFootballLeague(competition)
  if (league) return league.defaultChannels

  const c = (competition ?? "").toLowerCase()
  if (c.includes("libertadores") || c.includes("sudamericana")) {
    return "Movistar+, DAZN"
  }
  if (c.includes("liga f") || c.includes("femenin")) {
    return "DAZN, RTVE Play, Teledeporte"
  }
  return "Movistar+, DAZN"
}

export function footballLeagueMatchClass(
  competition?: string | null
): string | null {
  return resolveFootballLeague(competition)?.cssClass ?? null
}

export function footballLeaguePriority(competition?: string | null): number {
  return resolveFootballLeague(competition)?.priority ?? 70
}
