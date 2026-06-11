/** Hosts permitidos para endpoints Web Push (RFC 8030). */
import { isExpoPushEndpoint } from "./expo-push-token"

const PUSH_ENDPOINT_HOSTS = new Set([
  "fcm.googleapis.com",
  "updates.push.services.mozilla.com",
  "updates-autopush.stage.mozaws.net",
  "wns2-p1.notify.windows.com",
  "wns2-p2.notify.windows.com",
  "web.push.apple.com",
  "push.services.mozilla.com",
])

export function isAllowedPushEndpoint(endpoint: string): boolean {
  if (isExpoPushEndpoint(endpoint)) return true
  try {
    const url = new URL(endpoint)
    if (url.protocol !== "https:") return false
    const host = url.hostname.toLowerCase()
    if (PUSH_ENDPOINT_HOSTS.has(host)) return true
    return host.endsWith(".notify.windows.com") || host.endsWith(".push.apple.com")
  } catch {
    return false
  }
}
