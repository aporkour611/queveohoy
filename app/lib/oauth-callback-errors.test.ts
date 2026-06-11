import { describe, expect, it } from "vitest"
import {
  buildOAuthLoginRedirectPath,
  resolveOAuthLoginErrorMessage,
} from "./oauth-callback-errors"

describe("oauth-callback-errors", () => {
  it("construye redirect con proveedor y detalle", () => {
    const path = buildOAuthLoginRedirectPath("https://queveohoy.es", {
      error: "exchange_failed",
      provider: "apple",
      detail: "Invalid client",
      next: "/cuenta",
    })

    expect(path).toContain("/cuenta/login?")
    expect(path).toContain("error=exchange_failed")
    expect(path).toContain("provider=apple")
    expect(path).toContain("detail=")
    expect(path).toContain("next=")
  })

  it("mensaje por proveedor en access_denied", () => {
    expect(
      resolveOAuthLoginErrorMessage("access_denied", "google", null)
    ).toContain("Google")
  })

  it("mensaje genérico sin proveedor", () => {
    expect(resolveOAuthLoginErrorMessage("missing_code", null, null)).toContain(
      "incompleto"
    )
  })
})
