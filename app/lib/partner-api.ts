import { checkRateLimitDistributed } from "./rate-limit-distributed"
import { clientIp } from "./rate-limit"
import {
  PUBLIC_API_RATE_LIMIT,
  PUBLIC_API_RATE_WINDOW_MS,
} from "./public-api"

export type PartnerIdentity = {
  id: string
  label: string
}

/** Config interna (incluye secreto y webhook opcional). */
export type PartnerConfig = PartnerIdentity & {
  secret: string
  webhookUrl?: string
}

const DEFAULT_PARTNER_RATE_LIMIT = 300

export function partnerIdFromLabel(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 32) || "partner"
}

/**
 * PARTNER_API_KEYS: `secreto:Etiqueta` o `secreto:Etiqueta|https://webhook`
 * (pipe separa URL de webhook; no usar pipe en la etiqueta).
 */
function parsePartnerConfigs(): Map<string, PartnerConfig> {
  const map = new Map<string, PartnerConfig>()
  const raw = process.env.PARTNER_API_KEYS?.trim()
  if (!raw) return map

  for (const entry of raw.split(",")) {
    const piece = entry.trim()
    if (!piece) continue

    const pipe = piece.indexOf("|")
    const keyPart = (pipe >= 0 ? piece.slice(0, pipe) : piece).trim()
    const webhookUrl =
      pipe >= 0 ? piece.slice(pipe + 1).trim() : undefined

    const colon = keyPart.indexOf(":")
    const secret = (colon >= 0 ? keyPart.slice(0, colon) : keyPart).trim()
    const label = (colon >= 0 ? keyPart.slice(colon + 1) : "partner").trim()
    if (!secret) continue

    const id = partnerIdFromLabel(label || "partner")
    const config: PartnerConfig = {
      id,
      label: label || id,
      secret,
      ...(webhookUrl?.startsWith("http") ? { webhookUrl } : {}),
    }
    map.set(secret, config)
  }

  return map
}

let cachedKeys: Map<string, PartnerConfig> | null = null

function partnerConfigMap(): Map<string, PartnerConfig> {
  if (!cachedKeys) cachedKeys = parsePartnerConfigs()
  return cachedKeys
}

export function listPartnerConfigsWithWebhook(): PartnerConfig[] {
  return [...partnerConfigMap().values()].filter((p) => Boolean(p.webhookUrl))
}

export function isPartnerWebhooksConfigured(): boolean {
  return listPartnerConfigsWithWebhook().length > 0
}

export function isPartnerApiConfigured(): boolean {
  return partnerConfigMap().size > 0
}

export function extractApiKeyFromRequest(request: Request): string | null {
  const headerKey = request.headers.get("x-api-key")?.trim()
  if (headerKey) return headerKey

  const auth = request.headers.get("authorization")?.trim()
  if (auth?.toLowerCase().startsWith("bearer ")) {
    return auth.slice(7).trim()
  }

  return null
}

export function resolvePartnerApiKey(request: Request): PartnerIdentity | null {
  const provided = extractApiKeyFromRequest(request)
  if (!provided) return null
  const config = partnerConfigMap().get(provided)
  if (!config) return null
  return { id: config.id, label: config.label }
}

export function getPartnerRateLimit(): number {
  const parsed = Number.parseInt(process.env.PARTNER_API_RATE_LIMIT ?? "", 10)
  if (!Number.isFinite(parsed) || parsed < 60) return DEFAULT_PARTNER_RATE_LIMIT
  return Math.min(parsed, 600)
}

export type PublicFeedRateLimitResult =
  | { ok: true; partner: PartnerIdentity | null; limit: number }
  | { ok: false; retryAfterSec: number; partner: PartnerIdentity | null }

export async function enforcePublicFeedRateLimit(
  request: Request,
  options: { allowPartnerKeys: boolean }
): Promise<PublicFeedRateLimitResult> {
  const provided = extractApiKeyFromRequest(request)

  if (options.allowPartnerKeys && provided) {
    const partner = resolvePartnerApiKey(request)
    if (!partner) {
      return { ok: false, retryAfterSec: 60, partner: null }
    }

    const limit = getPartnerRateLimit()
    const rate = await checkRateLimitDistributed(
      `partner-api:${partner.id}`,
      limit,
      PUBLIC_API_RATE_WINDOW_MS
    )

    if (!rate.ok) {
      return { ok: false, retryAfterSec: rate.retryAfterSec, partner }
    }

    return { ok: true, partner, limit }
  }

  const ip = clientIp(request)
  const rate = await checkRateLimitDistributed(
    `public-api:${ip}`,
    PUBLIC_API_RATE_LIMIT,
    PUBLIC_API_RATE_WINDOW_MS
  )

  if (!rate.ok) {
    return { ok: false, retryAfterSec: rate.retryAfterSec, partner: null }
  }

  return { ok: true, partner: null, limit: PUBLIC_API_RATE_LIMIT }
}

/** Reinicia caché de claves (tests). */
export function resetPartnerApiKeyCacheForTests(): void {
  cachedKeys = null
}
