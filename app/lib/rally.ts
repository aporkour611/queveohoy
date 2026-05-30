import {
  getMadridWeekDates,
  parseUtcIso,
  splitToMadrid,
  toMadridDateKey,
} from "./madrid-time"
import { fetchJsonWithTimeout } from "./fetch-json"

const API_BASE = "https://www.thesportsdb.com/api/v1/json/3"
/** WRC — World Rally Championship en TheSportsDB. */
const WRC_LEAGUE_ID = "4370"

export type RallyCronEvent = {
  external_id: string
  title: string
  date: string
  time: string
  sport: "rally"
  category: "deportes"
  competition: string
  platform: string
  source: string
}

type RawEvent = {
  idEvent?: string
  strEvent?: string
  strTimestamp?: string
  dateEvent?: string
  strTime?: string
  strTimeLocal?: string
  strLeague?: string
  strVenue?: string
  strCountry?: string
  strPoster?: string | null
  strThumb?: string | null
  strStatus?: string
  strPostponed?: string
}

function encodeRallySource(poster?: string | null, thumb?: string | null): string {
  const parts = ["tsdb", "league:4370"]
  const image = poster?.trim() || thumb?.trim()
  if (image) parts.push(`img:${image}`)
  return parts.join("|")
}

function normalizeRallyEvent(
  raw: RawEvent,
  weekDates: string[]
): RallyCronEvent | null {
  if (!raw.idEvent || !raw.strEvent) return null
  if (raw.strPostponed === "yes") return null
  if (raw.strStatus === "FT") return null

  let date: string
  let time: string

  if (raw.strTimestamp) {
    ;({ date, time } = splitToMadrid(parseUtcIso(raw.strTimestamp)))
  } else if (raw.dateEvent) {
    date = raw.dateEvent
    time = (raw.strTimeLocal || raw.strTime || "12:00:00").slice(0, 5)
  } else {
    return null
  }

  const today = toMadridDateKey(new Date())
  const weekEnd = weekDates[weekDates.length - 1]
  if (date < today || date > weekEnd) return null

  const title = raw.strEvent.trim()
  if (!title) return null

  return {
    external_id: `tsdb_rally_${raw.idEvent}`,
    title,
    date,
    time,
    sport: "rally",
    category: "deportes",
    competition: raw.strLeague?.trim() || "WRC",
    platform: "DAZN, Movistar+, Red Bull TV",
    source: encodeRallySource(raw.strPoster, raw.strThumb),
  }
}

export async function fetchRallyCronEvents(
  dayWindow = 7
): Promise<RallyCronEvent[]> {
  const weekDates = getMadridWeekDates(dayWindow)
  const season = new Date().getFullYear()

  const url = `${API_BASE}/eventsseason.php?id=${WRC_LEAGUE_ID}&s=${season}`
  const result = await fetchJsonWithTimeout<{ events?: RawEvent[] | null }>(
    url,
    {},
    18_000
  )

  if (!result.ok || !result.data) return []

  const rawEvents = result.data.events
  if (!rawEvents?.length) return []

  const normalized = rawEvents
    .map((event) => normalizeRallyEvent(event, weekDates))
    .filter((event): event is RallyCronEvent => event !== null)

  return normalized.slice(0, 12)
}
