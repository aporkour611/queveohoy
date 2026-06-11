import { createHmac } from "node:crypto"
import { listPartnerConfigsWithWebhook } from "./partner-api"
import { appendPartnerWebhookHistory } from "./partner-webhook-history-store"

export type PartnerFeedWebhookPayload = {
  event: "feed.updated"
  generatedAt: string
  date: string
  eventCount: number
  version: string
}

export type PartnerWebhookDelivery = {
  partnerId: string
  ok: boolean
  status?: number
  attempts: number
  error?: string
}

export type PartnerWebhookNotifyResult = {
  configured: number
  sent: number
  failed: number
  deliveries: PartnerWebhookDelivery[]
}

const WEBHOOK_MAX_ATTEMPTS = 3
const WEBHOOK_BASE_DELAY_MS = 500
const WEBHOOK_TIMEOUT_MS = 8_000

function signWebhookBody(secret: string, body: string): string {
  return createHmac("sha256", secret).update(body).digest("hex")
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function shouldRetryWebhookStatus(status: number): boolean {
  if (status === 429) return true
  if (status >= 500) return true
  return false
}

function webhookFetchSignal(): AbortSignal | undefined {
  return typeof AbortSignal.timeout === "function"
    ? AbortSignal.timeout(WEBHOOK_TIMEOUT_MS)
    : undefined
}

export async function deliverPartnerWebhook(
  url: string,
  partnerId: string,
  secret: string,
  body: string,
  event: PartnerFeedWebhookPayload["event"],
  fetchImpl: typeof fetch = fetch
): Promise<PartnerWebhookDelivery> {
  let lastError: string | undefined
  let lastStatus: number | undefined

  for (let attempt = 1; attempt <= WEBHOOK_MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetchImpl(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Queveohoy-Event": event,
          "X-Queveohoy-Partner": partnerId,
          "X-Queveohoy-Signature": `sha256=${signWebhookBody(secret, body)}`,
          "User-Agent": "queveohoy-partner-webhook/1",
        },
        body,
        signal: webhookFetchSignal(),
      })

      lastStatus = res.status
      if (res.ok) {
        return {
          partnerId,
          ok: true,
          status: res.status,
          attempts: attempt,
        }
      }

      lastError = `HTTP ${res.status}`
      if (!shouldRetryWebhookStatus(res.status) || attempt === WEBHOOK_MAX_ATTEMPTS) {
        return {
          partnerId,
          ok: false,
          status: res.status,
          attempts: attempt,
          error: lastError,
        }
      }
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err)
      if (attempt === WEBHOOK_MAX_ATTEMPTS) {
        return {
          partnerId,
          ok: false,
          status: lastStatus,
          attempts: attempt,
          error: lastError,
        }
      }
    }

    await sleep(WEBHOOK_BASE_DELAY_MS * 2 ** (attempt - 1))
  }

  return {
    partnerId,
    ok: false,
    status: lastStatus,
    attempts: WEBHOOK_MAX_ATTEMPTS,
    error: lastError ?? "unknown",
  }
}

export async function notifyPartnerFeedWebhooks(
  payload: PartnerFeedWebhookPayload
): Promise<PartnerWebhookNotifyResult> {
  const partners = listPartnerConfigsWithWebhook()
  const body = JSON.stringify(payload)
  const deliveries: PartnerWebhookDelivery[] = []

  await Promise.all(
    partners.map(async (partner) => {
      const delivery = await deliverPartnerWebhook(
        partner.webhookUrl!,
        partner.id,
        partner.secret,
        body,
        payload.event
      )
      deliveries.push(delivery)
    })
  )

  const sent = deliveries.filter((d) => d.ok).length
  const result: PartnerWebhookNotifyResult = {
    configured: partners.length,
    sent,
    failed: deliveries.length - sent,
    deliveries,
  }

  if (result.configured > 0) {
    try {
      await appendPartnerWebhookHistory(payload, result)
    } catch {
      /* history is best-effort */
    }
  }

  return result
}
