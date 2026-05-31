import { evaluateCronHealth, type CronHealthInput } from "./cron-alerts"

export type CronMetricRow = {
  id: string
  label: string
  value: string
  status: "ok" | "warn" | "error"
}

export type CronMetricsSummary = {
  timestamp: string | null
  ok: boolean
  rows: CronMetricRow[]
  alerts: number
  totalIngested: number
}

type CronResultPayload = CronHealthInput & {
  ok?: boolean
  timestamp?: string
  football?: { count?: number; errors?: string[] }
  esports?: number
  f1?: number
  motos?: number
  rally?: number
  tenisCiclismo?: number
  basket?: number
  tmdbMovies?: number
  tmdbSeries?: number
  anime?: number
  reality?: number
  spanishTv?: number
  ufc?: number
  pastDayPurged?: number
  duplicatesRemoved?: number
  crestsEnriched?: number
  feedCache?: { ok?: boolean }
}

function row(
  id: string,
  label: string,
  value: string,
  status: CronMetricRow["status"] = "ok"
): CronMetricRow {
  return { id, label, value, status }
}

function errorRow(id: string, label: string, err?: string): CronMetricRow | null {
  if (!err?.trim()) return null
  return row(id, label, err.trim(), "error")
}

export function buildCronMetricsSummary(
  payload: CronResultPayload | null
): CronMetricsSummary {
  if (!payload) {
    return {
      timestamp: null,
      ok: false,
      rows: [row("empty", "Última ejecución", "Sin datos guardados", "warn")],
      alerts: 0,
      totalIngested: 0,
    }
  }

  const alerts = evaluateCronHealth(payload).length
  const footballCount = payload.football?.count ?? 0
  const rows: CronMetricRow[] = [
    row("football", "Fútbol", String(footballCount), footballCount > 0 ? "ok" : "warn"),
    row("esports", "E-sports", String(payload.esports ?? 0)),
    row("f1", "F1", String(payload.f1 ?? 0)),
    row("motos", "MotoGP", String(payload.motos ?? 0)),
    row("rally", "Rally", String(payload.rally ?? 0)),
    row("tenis", "Tenis / ciclismo", String(payload.tenisCiclismo ?? 0)),
    row("basket", "Baloncesto", String(payload.basket ?? 0)),
    row(
      "tmdb",
      "TMDB cine/series",
      `${payload.tmdbMovies ?? 0} / ${payload.tmdbSeries ?? 0}`
    ),
    row("anime", "Anime", String(payload.anime ?? 0)),
    row("reality", "Reality TV", String(payload.reality ?? 0)),
    row("spanishTv", "TV España", String(payload.spanishTv ?? 0)),
    row("ufc", "UFC", String(payload.ufc ?? 0)),
    row("purge", "Purgados (día anterior)", String(payload.pastDayPurged ?? 0)),
    row("dedupe", "Duplicados eliminados", String(payload.duplicatesRemoved ?? 0)),
    row("crests", "Escudos enriquecidos", String(payload.crestsEnriched ?? 0)),
    row(
      "feedCache",
      "Caché feed",
      payload.feedCache?.ok ? "OK" : "Falló",
      payload.feedCache?.ok ? "ok" : "warn"
    ),
  ]

  for (const errRow of [
    errorRow("esportsErr", "E-sports", payload.esportsError),
    errorRow("f1Err", "F1", payload.f1Error),
    errorRow("tmdbErr", "TMDB", payload.tmdbError),
    errorRow("dedupeErr", "Dedupe", payload.dedupeError),
  ]) {
    if (errRow) rows.push(errRow)
  }

  const totalIngested =
    footballCount +
    (payload.esports ?? 0) +
    (payload.f1 ?? 0) +
    (payload.motos ?? 0) +
    (payload.rally ?? 0) +
    (payload.tenisCiclismo ?? 0) +
    (payload.basket ?? 0) +
    (payload.tmdbMovies ?? 0) +
    (payload.tmdbSeries ?? 0) +
    (payload.anime ?? 0) +
    (payload.reality ?? 0) +
    (payload.spanishTv ?? 0) +
    (payload.ufc ?? 0)

  return {
    timestamp: payload.timestamp ?? null,
    ok: payload.ok !== false && alerts === 0,
    rows,
    alerts,
    totalIngested,
  }
}
