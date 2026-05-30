export type CountResult = {
  count: number
  error?: string
  dateFrom?: string
  dateTo?: string
  errors?: string[]
}

export type CronSourceResult = CountResult | {
  count: number
  purged: number
  error?: string
}

export const CRON_ROW_SELECT =
  "id, title, date, time, sport, home_team, away_team, external_id, source, platform, competition"

export const FOOTBALL_COMPETITIONS = [
  "PD",
  "CL",
  "PL",
  "BL1",
  "SA",
  "WC",
  "FL1",
  "EL",
  "ECL",
  "CDR",
] as const

export const MAX_CREST_ENRICH = 20
