import { describe, expect, it } from "vitest"
import {
  buildExpoPushEndpoint,
  isExpoPushEndpoint,
  isValidExpoPushToken,
  parseExpoPushTokenFromEndpoint,
} from "./expo-push-token"

describe("expo-push-token", () => {
  it("valida tokens Expo", () => {
    expect(isValidExpoPushToken("ExponentPushToken[abc123]")).toBe(true)
    expect(isValidExpoPushToken("invalid")).toBe(false)
  })

  it("construye endpoint expo:", () => {
    expect(buildExpoPushEndpoint("ExponentPushToken[abc123]")).toBe(
      "expo:ExponentPushToken[abc123]"
    )
  })

  it("parsea token desde endpoint", () => {
    const endpoint = "expo:ExponentPushToken[xyz]"
    expect(isExpoPushEndpoint(endpoint)).toBe(true)
    expect(parseExpoPushTokenFromEndpoint(endpoint)).toBe(
      "ExponentPushToken[xyz]"
    )
  })
})
