import { SITE_URL } from "./api"

export const WEEK_VIEW_WEB_URL = `${SITE_URL}/?week=1`

export const CUENTA_WEB_URL = `${SITE_URL}/cuenta`

export function buildWeekViewWebUrlWithFilters(filterIds: string[]): string {
  if (filterIds.length === 0) return WEEK_VIEW_WEB_URL
  const encoded = encodeURIComponent(filterIds.join(","))
  return `${SITE_URL}/?filtros=${encoded}&week=1`
}
