import { describe, expect, it } from "vitest"
import {
  ensureHttpsOrigin,
  formatMobileNetworkError,
  isLikelyTlsError,
} from "../../mobile/lib/ensure-https"

describe("ensureHttpsOrigin", () => {
  it("fuerza https en prod", () => {
    expect(ensureHttpsOrigin("http://queveohoy.es", "https://x.es")).toBe(
      "https://queveohoy.es"
    )
  })

  it("permite localhost http", () => {
    expect(ensureHttpsOrigin("http://127.0.0.1:8081", "https://x.es")).toBe(
      "http://127.0.0.1:8081"
    )
  })
})

describe("formatMobileNetworkError", () => {
  it("detecta TLS", () => {
    expect(isLikelyTlsError("SSL handshake failed")).toBe(true)
    expect(isLikelyTlsError("Network request failed")).toBe(false)
  })

  it("mensaje cold start en timeout", () => {
    expect(formatMobileNetworkError("Request timed out")).toContain("cold start")
  })
})
