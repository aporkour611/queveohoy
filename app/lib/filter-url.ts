import { ALL_SPORT_IDS } from "./filter-config"

const FILTER_PARAM = "filtros"

/** IDs válidos separados por coma (sin espacios). */
export function parseFilterParam(raw: string | null | undefined): string[] {
  if (!raw?.trim()) return []

  const ids = raw
    .split(",")
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean)

  const valid = new Set(ALL_SPORT_IDS)
  return [...new Set(ids.filter((id) => valid.has(id)))]
}

export function buildFilterParam(ids: string[]): string | null {
  const valid = parseFilterParam(ids.join(","))
  if (valid.length === 0) return null
  return valid.join(",")
}

export function buildFilterSearch(ids: string[]): string {
  const param = buildFilterParam(ids)
  if (!param) return ""
  return `?${FILTER_PARAM}=${encodeURIComponent(param)}`
}

export function readFilterParamFromSearch(search: string): string[] {
  if (!search.startsWith("?")) {
    return parseFilterParam(new URLSearchParams(search).get(FILTER_PARAM))
  }
  return parseFilterParam(new URLSearchParams(search).get(FILTER_PARAM))
}

export function syncFilterParamInUrl(ids: string[]): void {
  if (typeof window === "undefined") return

  const url = new URL(window.location.href)
  const param = buildFilterParam(ids)

  if (param) url.searchParams.set(FILTER_PARAM, param)
  else url.searchParams.delete(FILTER_PARAM)

  const next = `${url.pathname}${url.search}${url.hash}`
  const current = `${window.location.pathname}${window.location.search}${window.location.hash}`
  if (next === current) return

  window.history.replaceState(window.history.state, "", next)
}
