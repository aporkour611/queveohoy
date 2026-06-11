import { ALL_SPORT_IDS } from "./filter-config"

const FILTER_PARAM = "filtros"

export const WEEK_VIEW_PARAM = "week"
export const WEEK_VIEW_VALUE = "1"

/** Deep link `/?week=1` para abrir la vista semanal al hidratar. */
export function buildWeekViewHomeUrl(): string {
  return `/?${WEEK_VIEW_PARAM}=${WEEK_VIEW_VALUE}`
}

/** Semana + filtros activos (`/?week=1&filtros=futbol`). */
export function buildWeekViewHomeUrlWithFilters(ids: string[]): string {
  const filterSearch = buildFilterSearch(ids)
  if (!filterSearch) return buildWeekViewHomeUrl()

  const params = new URLSearchParams(filterSearch.slice(1))
  params.set(WEEK_VIEW_PARAM, WEEK_VIEW_VALUE)
  return `/?${params.toString()}`
}

export function readWeekViewFromSearch(search: string): boolean {
  const raw = search.startsWith("?") ? search.slice(1) : search
  return new URLSearchParams(raw).get(WEEK_VIEW_PARAM) === WEEK_VIEW_VALUE
}

/** Quita `week=1` del query string (sin prefijo `?`). */
export function stripWeekViewFromSearch(search: string): string {
  const raw = search.startsWith("?") ? search.slice(1) : search
  const params = new URLSearchParams(raw)
  params.delete(WEEK_VIEW_PARAM)
  return params.toString()
}

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

let filterUrlSyncTimer: ReturnType<typeof setTimeout> | undefined

function applyFilterParamInUrl(ids: string[]): void {
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

/** Sincroniza `?filtros=` con debounce para no saturar history al togglear chips. */
export function syncFilterParamInUrl(ids: string[], options?: { immediate?: boolean }): void {
  if (typeof window === "undefined") return

  if (options?.immediate) {
    if (filterUrlSyncTimer) clearTimeout(filterUrlSyncTimer)
    filterUrlSyncTimer = undefined
    applyFilterParamInUrl(ids)
    return
  }

  if (filterUrlSyncTimer) clearTimeout(filterUrlSyncTimer)
  filterUrlSyncTimer = setTimeout(() => {
    filterUrlSyncTimer = undefined
    applyFilterParamInUrl(ids)
  }, 280)
}
