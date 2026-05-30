export type UserPreferences = {
  platforms: string[]
  primeTime: string
  hiddenSports: string[]
  spoilersOff: boolean
}

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  platforms: [],
  primeTime: "18:00",
  hiddenSports: [],
  spoilersOff: false,
}

/** Plataformas habituales en España para «Mis plataformas». */
export const SPANISH_PLATFORM_OPTIONS = [
  "Movistar+",
  "DAZN",
  "LaLiga TV / HypTV",
  "Netflix",
  "HBO Max",
  "Disney+",
  "Prime Video",
  "Apple TV+",
  "Antena 3 · ATRESPLAYER",
  "RTVE Play",
  "Sky Showtime",
  "M+ LALIGA",
] as const

type PreferencesRow = {
  platforms?: string[] | null
  prime_time?: string | null
  hidden_sports?: string[] | null
  spoilers_off?: boolean | null
}

export function parseUserPreferences(row: PreferencesRow | null): UserPreferences {
  if (!row) return { ...DEFAULT_USER_PREFERENCES }

  return {
    platforms: Array.isArray(row.platforms) ? row.platforms.filter(Boolean) : [],
    primeTime: row.prime_time?.trim() || DEFAULT_USER_PREFERENCES.primeTime,
    hiddenSports: Array.isArray(row.hidden_sports)
      ? row.hidden_sports.filter(Boolean)
      : [],
    spoilersOff: Boolean(row.spoilers_off),
  }
}

export function serializeUserPreferences(prefs: UserPreferences): PreferencesRow {
  return {
    platforms: prefs.platforms,
    prime_time: prefs.primeTime,
    hidden_sports: prefs.hiddenSports,
    spoilers_off: prefs.spoilersOff,
  }
}

export function eventMatchesUserPlatforms(
  platformField: string | null | undefined,
  userPlatforms: string[]
): boolean {
  if (!userPlatforms.length) return true
  const blob = (platformField ?? "").toLowerCase()
  if (!blob) return false

  return userPlatforms.some((platform) => {
    const needle = platform.toLowerCase()
    return blob.includes(needle) || needle.split(/[^a-z0-9+]+/).some(
      (token) => token.length > 2 && blob.includes(token)
    )
  })
}
