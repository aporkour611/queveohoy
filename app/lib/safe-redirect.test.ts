import { describe, expect, it } from "vitest"
import { sanitizeInternalRedirectPath } from "./safe-redirect"

describe("sanitizeInternalRedirectPath", () => {
  it("allows internal paths", () => {
    expect(sanitizeInternalRedirectPath("/cuenta")).toBe("/cuenta")
    expect(sanitizeInternalRedirectPath("/?filtros=futbol")).toBe("/?filtros=futbol")
  })

  it("blocks open redirects", () => {
    expect(sanitizeInternalRedirectPath("//evil.com")).toBe("/cuenta")
    expect(sanitizeInternalRedirectPath("/\\evil")).toBe("/cuenta")
    expect(sanitizeInternalRedirectPath("https://evil.com")).toBe("/cuenta")
    expect(sanitizeInternalRedirectPath("/%2f%2fevil.com")).toBe("/cuenta")
  })

  it("uses fallback for empty", () => {
    expect(sanitizeInternalRedirectPath(null)).toBe("/cuenta")
    expect(sanitizeInternalRedirectPath("", "/")).toBe("/")
  })
})
