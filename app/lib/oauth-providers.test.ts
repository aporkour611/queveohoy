import { describe, expect, it } from "vitest"
import { OAUTH_PROVIDERS } from "./oauth-providers"

describe("OAUTH_PROVIDERS", () => {
  it("incluye Google, Apple y Microsoft (azure)", () => {
    expect(OAUTH_PROVIDERS.map((p) => p.id)).toEqual([
      "google",
      "apple",
      "azure",
    ])
  })
})
