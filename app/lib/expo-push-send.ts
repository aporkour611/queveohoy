export type ExpoPushPayload = {
  title: string
  body: string
  data?: Record<string, unknown>
}

type ExpoTicket =
  | { status: "ok"; id?: string }
  | { status: "error"; message?: string; details?: { error?: string } }

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send"

export async function sendExpoPushMessage(
  expoPushToken: string,
  payload: ExpoPushPayload
): Promise<"sent" | "expired" | "error"> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  }

  const accessToken = process.env.EXPO_ACCESS_TOKEN?.trim()
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`
  }

  const res = await fetch(EXPO_PUSH_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({
      to: expoPushToken,
      title: payload.title,
      body: payload.body,
      data: payload.data ?? {},
      sound: "default",
      priority: "high",
    }),
    signal:
      typeof AbortSignal.timeout === "function"
        ? AbortSignal.timeout(8_000)
        : undefined,
  })

  if (!res.ok) {
    return "error"
  }

  const json = (await res.json()) as { data?: ExpoTicket[] }
  const ticket = json.data?.[0]
  if (!ticket) return "error"

  if (ticket.status === "ok") return "sent"

  const detail = ticket.details?.error ?? ticket.message ?? ""
  if (/DeviceNotRegistered|InvalidCredentials/i.test(detail)) {
    return "expired"
  }

  return "error"
}
