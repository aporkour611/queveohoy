import { createHmac } from "node:crypto"
import { listPartnerConfigsWithWebhook } from "./partner-api"

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
  error?: string
}

export type PartnerWebhookNotifyResult = {
  configured: number
  sent: number
  failed: number
  deliveries: PartnerWebhookDelivery[]
}

function signWebhookBody(secret: string, body: string): string {
  return createHmac("sha256", secret).update(body).digest("hex")
}

export async function notifyPartnerFeedWebhooks(
  payload: PartnerFeedWebhookPayload
): Promise<PartnerWebhookNotifyResult> {
  const partners = listPartnerConfigsWithWebhook()
  const body = JSON.stringify(payload)
  const deliveries: PartnerWebhookDelivery[] = []

  await Promise.all(
    partners.map(async (partner) => {
      const url = partner.webhookUrl!
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Queveohoy-Event": payload.event,
            "X-Queveohoy-Partner": partner.id,
            "X-Queveohoy-Signature": `sha256=${signWebhookBody(partner.secret, body)}`,
            "User-Agent": "queveohoy-partner-webhook/1",
          },
          body,
          signal:
            typeof AbortSignal.timeout === "function"
              ? AbortSignal.timeout(8_000)
              : undefined,
        })

        deliveries.push({
          partnerId: partner.id,
          ok: res.ok,
          status: res.status,
          ...(res.ok
            ? {}
            : { error: `HTTP ${res.status}` }),
        })
      } catch (err) {
        deliveries.push({
          partnerId: partner.id,
          ok: false,
          error: err instanceof Error ? err.message : String(err),
        })
      }
    })
  )

  const sent = deliveries.filter((d) => d.ok).length
  return {
    configured: partners.length,
    sent,
    failed: deliveries.length - sent,
    deliveries,
  }
}
