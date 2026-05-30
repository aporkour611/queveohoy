import type { UserPreferences } from "./user-preferences"

export const USER_PLATFORMS_STORAGE_KEY = "qvh-user-platforms"
export const USER_PLATFORMS_CHANGED_EVENT = "qvh-user-platforms-changed"

export function readStoredUserPlatforms(): string[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(USER_PLATFORMS_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item): item is string => typeof item === "string")
  } catch {
    return []
  }
}

export function writeStoredUserPlatforms(platforms: string[]): void {
  if (typeof window === "undefined") return
  window.localStorage.setItem(
    USER_PLATFORMS_STORAGE_KEY,
    JSON.stringify(platforms)
  )
  window.dispatchEvent(new CustomEvent(USER_PLATFORMS_CHANGED_EVENT))
}

export function syncStoredUserPlatforms(prefs: UserPreferences): void {
  writeStoredUserPlatforms(prefs.platforms)
}
