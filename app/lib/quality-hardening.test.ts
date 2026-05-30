import { describe, expect, it, vi } from "vitest"
import { sanitizeHiddenSports } from "./user-preferences"

describe("sanitizeHiddenSports", () => {
  it("keeps valid sport ids only", () => {
    expect(sanitizeHiddenSports(["futbol", "invalid", "tenis"])).toEqual([
      "futbol",
      "tenis",
    ])
  })

  it("dedupes", () => {
    expect(sanitizeHiddenSports(["futbol", "futbol"])).toEqual(["futbol"])
  })
})

describe("fetchEventById", () => {
  it("exports query helper", async () => {
    const mod = await import("./events-feed-server")
    expect(typeof mod.fetchEventById).toBe("function")
  })
})

describe("logger", () => {
  it("emits structured json", async () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {})
    const { log } = await import("./logger")
    log.info("test-event", { route: "/api/health" })
    expect(spy).toHaveBeenCalled()
    const payload = JSON.parse(String(spy.mock.calls[0]?.[0]))
    expect(payload.level).toBe("info")
    expect(payload.msg).toBe("test-event")
    spy.mockRestore()
  })
})
