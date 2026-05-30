import { describe, expect, it, vi, beforeEach, afterEach } from "vitest"
import {
  isSyntheticAudit,
  isTouchPreferred,
  subscribeFeedHydration,
} from "./interaction-gate"

describe("interaction-gate", () => {
  it("isTouchPreferred es false en entorno node", () => {
    expect(isTouchPreferred()).toBe(false)
  })

  describe("isSyntheticAudit", () => {
    const originalNavigator = global.navigator

    beforeEach(() => {
      vi.stubGlobal("navigator", {
        ...originalNavigator,
        webdriver: false,
        userAgent: "Mozilla/5.0 Chrome/120",
      })
    })

    afterEach(() => {
      vi.unstubAllGlobals()
    })

    it("detecta webdriver", () => {
      vi.stubGlobal("navigator", {
        webdriver: true,
        userAgent: "Mozilla/5.0 Chrome/120",
      })
      expect(isSyntheticAudit()).toBe(true)
    })

    it("detecta UA de Lighthouse", () => {
      vi.stubGlobal("navigator", {
        webdriver: false,
        userAgent: "Mozilla/5.0 Chrome-Lighthouse",
      })
      expect(isSyntheticAudit()).toBe(true)
    })
  })

  describe("subscribeFeedHydration", () => {
    it("no registra listeners en auditoría sintética", () => {
      vi.stubGlobal("navigator", {
        webdriver: true,
        userAgent: "Mozilla/5.0",
      })
      const onActivate = vi.fn()
      const cleanup = subscribeFeedHydration({ onActivate })
      cleanup()
      expect(onActivate).not.toHaveBeenCalled()
    })
  })
})
