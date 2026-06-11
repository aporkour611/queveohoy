/** Expo push tokens almacenados como endpoint `expo:ExponentPushToken[...]`. */
export const EXPO_PUSH_ENDPOINT_PREFIX = "expo:"

const EXPO_TOKEN_PATTERN =
  /^ExponentPushToken\[[A-Za-z0-9_-]+\]$|^ExpoPushToken\[[A-Za-z0-9_-]+\]$/

export function isExpoPushEndpoint(endpoint: string): boolean {
  return endpoint.startsWith(EXPO_PUSH_ENDPOINT_PREFIX)
}

export function parseExpoPushTokenFromEndpoint(endpoint: string): string | null {
  if (!isExpoPushEndpoint(endpoint)) return null
  const token = endpoint.slice(EXPO_PUSH_ENDPOINT_PREFIX.length).trim()
  return EXPO_TOKEN_PATTERN.test(token) ? token : null
}

export function buildExpoPushEndpoint(expoPushToken: string): string | null {
  const token = expoPushToken.trim()
  if (!EXPO_TOKEN_PATTERN.test(token)) return null
  return `${EXPO_PUSH_ENDPOINT_PREFIX}${token}`
}

export function isValidExpoPushToken(token: string): boolean {
  return EXPO_TOKEN_PATTERN.test(token.trim())
}
