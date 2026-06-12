/**
 * Infraestructura de monetización (display / afiliados).
 * Activar en prod: NEXT_PUBLIC_ADS_ENABLED=1 + IDs de red en env.
 */

export type AdSlotId = "feed-mid" | "feed-footer" | "hub-sidebar"

export type AdSlotConfig = {
  id: AdSlotId
  label: string
  /** Altura mínima reservada (evita CLS) */
  minHeightPx: number
  /** Placeholder editorial hasta conectar red */
  placeholder: boolean
}

export const AD_SLOTS: Record<AdSlotId, AdSlotConfig> = {
  "feed-mid": {
    id: "feed-mid",
    label: "Patrocinio",
    minHeightPx: 90,
    placeholder: true,
  },
  "feed-footer": {
    id: "feed-footer",
    label: "Publicidad",
    minHeightPx: 100,
    placeholder: true,
  },
  "hub-sidebar": {
    id: "hub-sidebar",
    label: "Publicidad",
    minHeightPx: 250,
    placeholder: true,
  },
}

export function isAdsGloballyEnabled(): boolean {
  return (
    process.env.NEXT_PUBLIC_ADS_ENABLED === "1" ||
    process.env.NEXT_PUBLIC_ADS_PREVIEW === "1"
  )
}

export function isAdSlotEnabled(slot: AdSlotId): boolean {
  if (!isAdsGloballyEnabled()) return false
  const envKey = `NEXT_PUBLIC_AD_SLOT_${slot.toUpperCase().replace(/-/g, "_")}`
  const flag = process.env[envKey]
  if (flag === "0") return false
  return true
}

export function getAdNetworkClientId(): string | null {
  const id = process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.trim()
  return id || null
}

export function getAdSlotUnitId(slot: AdSlotId): string | null {
  const envKey = `NEXT_PUBLIC_AD_UNIT_${slot.toUpperCase().replace(/-/g, "_")}`
  const id = process.env[envKey]?.trim()
  return id || null
}

/** Consentimiento de cookies aceptado = base para analytics y ads. */
export function hasMonetizationConsent(): boolean {
  if (typeof window === "undefined") return false
  try {
    return localStorage.getItem("qvh-cookie-consent") === "accepted"
  } catch {
    return false
  }
}
