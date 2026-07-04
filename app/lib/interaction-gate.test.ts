import { describe, expect, it, vi, beforeEach, afterEach } from "vitest"
import {
  isMobileLabOnDesktop,
  isSyntheticAudit,
  isTouchPreferred,
  shouldDeferHeavyClient,
  subscribeFeedHydration,
} from "./interaction-gate"

function stubWindowMatchMedia(rules: Record<string, boolean>) {
  const matchMedia = (query: string) => ({
    matches: rules[query] ?? false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })
  vi.stubGlobal("window", { matchMedia })
  vi.stubGlobal("matchMedia", matchMedia)
}

describe("interaction-gate", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("isTouchPreferred es false en entorno node", () => {
    expect(isTouchPreferred()).toBe(false)
  })

  describe("isSyntheticAudit", () => {
    beforeEach(() => {
      vi.stubGlobal("navigator", {
        webdriver: false,
        userAgent: "Mozilla/5.0 Chrome/120",
      })
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

    it("detecta flag síncrona qvhDefer", () => {
      vi.stubGlobal("document", {
        documentElement: { dataset: { qvhDefer: "1" } },
      })
      vi.stubGlobal("navigator", {
        webdriver: false,
        userAgent: "Mozilla/5.0 Chrome/120",
      })
      expect(isSyntheticAudit()).toBe(true)
    })
  })

  describe("isMobileLabOnDesktop", () => {
    it("detecta PSI mobile emulado en desktop", () => {
      vi.stubGlobal("navigator", {
        webdriver: false,
        userAgent: "Mozilla/5.0 Chrome/120",
      })
      stubWindowMatchMedia({
        "(max-width: 720px)": true,
        "(pointer: fine)": true,
        "(hover: hover)": true,
      })
      expect(isMobileLabOnDesktop()).toBe(true)
      expect(shouldDeferHeavyClient()).toBe(true)
    })

    it("detecta PSI mobile emulado sin hover", () => {
      vi.stubGlobal("navigator", {
        webdriver: false,
        userAgent: "Mozilla/5.0 Chrome/120",
      })
      stubWindowMatchMedia({
        "(max-width: 720px)": true,
        "(pointer: fine)": true,
        "(pointer: coarse)": false,
        "(hover: hover)": false,
      })
      expect(isMobileLabOnDesktop()).toBe(true)
      expect(shouldDeferHeavyClient()).toBe(true)
    })

    it("no bloquea móvil real", () => {
      vi.stubGlobal("navigator", {
        webdriver: false,
        userAgent: "Mozilla/5.0 (Linux; Android 13) Mobile Safari/537.36",
      })
      stubWindowMatchMedia({
        "(max-width: 720px)": true,
        "(pointer: coarse)": true,
        "(pointer: fine)": false,
        "(hover: hover)": false,
      })
      expect(isMobileLabOnDesktop()).toBe(false)
      expect(shouldDeferHeavyClient()).toBe(false)
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

    it("no registra listeners en lab mobile desktop", () => {
      vi.stubGlobal("navigator", {
        webdriver: false,
        userAgent: "Mozilla/5.0 Chrome/120",
      })
      stubWindowMatchMedia({
        "(max-width: 720px)": true,
        "(pointer: fine)": true,
        "(hover: hover)": true,
      })
      const onActivate = vi.fn()
      subscribeFeedHydration({ onActivate })
      expect(onActivate).not.toHaveBeenCalled()
    })
  })
})
