import { describe, expect, it } from "vitest"
import { isAllowedPushEndpoint } from "./push-endpoint"

describe("push-endpoint", () => {
  it("allows known FCM endpoints", () => {
    expect(
      isAllowedPushEndpoint("https://fcm.googleapis.com/fcm/send/abc")
    ).toBe(true)
  })

  it("allows expo push endpoints", () => {
    expect(isAllowedPushEndpoint("expo:ExponentPushToken[abc123]")).toBe(true)
  })

  it("rejects non-https endpoints", () => {
    expect(isAllowedPushEndpoint("http://fcm.googleapis.com/x")).toBe(false)
  })

  it("rejects unknown hosts", () => {
    expect(isAllowedPushEndpoint("https://evil.example.com/push")).toBe(false)
  })
})
