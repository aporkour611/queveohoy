const EXPO_PUSH_ENDPOINT_PREFIX = "expo:"

const EXPO_TOKEN_PATTERN =
  /^ExponentPushToken\[[A-Za-z0-9_-]+\]$|^ExpoPushToken\[[A-Za-z0-9_-]+\]$/

export function buildExpoPushEndpoint(expoPushToken: string): string | null {
  const token = expoPushToken.trim()
  if (!EXPO_TOKEN_PATTERN.test(token)) return null
  return `${EXPO_PUSH_ENDPOINT_PREFIX}${token}`
}
