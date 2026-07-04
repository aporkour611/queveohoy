import { describe, expect, it } from "vitest"
import { isSyntheticAuditUserAgent } from "./synthetic-audit"

describe("isSyntheticAuditUserAgent", () => {
  it("detecta HeadlessChrome (Lighthouse local)", () => {
    expect(
      isSyntheticAuditUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/150.0.0.0 Safari/537.36"
      )
    ).toBe(true)
  })

  it("detecta Chrome-Lighthouse", () => {
    expect(isSyntheticAuditUserAgent("Mozilla/5.0 Chrome-Lighthouse")).toBe(true)
  })

  it("detecta PageSpeed", () => {
    expect(isSyntheticAuditUserAgent("Mozilla/5.0 PTST/1.0")).toBe(true)
  })

  it("no marca Chrome móvil real", () => {
    expect(
      isSyntheticAuditUserAgent(
        "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36"
      )
    ).toBe(false)
  })
})
