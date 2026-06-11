import { describe, expect, it } from "vitest"
import { parseUserPushPreferencesFromRows } from "./push-user-preferences"

describe("parseUserPushPreferencesFromRows", () => {
  it("returns defaults when empty", () => {
    const prefs = parseUserPushPreferencesFromRows([])
    expect(prefs.hasSubscription).toBe(false)
    expect(prefs.favoritesOnly).toBe(false)
    expect(prefs.topics).toEqual(["futbol", "ufc", "series", "motor"])
    expect(prefs.platforms).toEqual([])
  })

  it("merges platforms and uses latest row", () => {
    const prefs = parseUserPushPreferencesFromRows([
      {
        endpoint: "expo:ExponentPushToken[abc]",
        topics: ["futbol"],
        favorites_only: true,
        updated_at: "2026-06-11T10:00:00Z",
      },
      {
        endpoint: "https://fcm.example/push",
        topics: ["ufc"],
        favorites_only: false,
        updated_at: "2026-06-10T10:00:00Z",
      },
    ])

    expect(prefs.hasSubscription).toBe(true)
    expect(prefs.favoritesOnly).toBe(true)
    expect(prefs.topics).toEqual(["futbol"])
    expect(prefs.platforms).toEqual(["expo", "web"])
    expect(prefs.updatedAt).toBe("2026-06-11T10:00:00Z")
  })
})
