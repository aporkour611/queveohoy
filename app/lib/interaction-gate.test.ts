import { describe, expect, it } from "vitest"
import { isTouchPreferred } from "./interaction-gate"

describe("interaction-gate", () => {
  it("isTouchPreferred es false en entorno node", () => {
    expect(isTouchPreferred()).toBe(false)
  })
})
