"use client"

import { useEffect, useState } from "react"
import {
  AD_SLOTS,
  getAdNetworkClientId,
  getAdSlotUnitId,
  hasMonetizationConsent,
  isAdSlotEnabled,
  type AdSlotId,
} from "@/app/lib/monetization-config"
import { subscribeCookieConsent } from "@/app/lib/cookie-consent"

type AdSlotProps = {
  slot: AdSlotId
  className?: string
}

export function AdSlot({ slot, className = "" }: AdSlotProps) {
  const config = AD_SLOTS[slot]
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const evaluate = () => {
      const preview = process.env.NEXT_PUBLIC_ADS_PREVIEW === "1"
      setVisible(
        isAdSlotEnabled(slot) &&
          (preview || hasMonetizationConsent())
      )
    }
    evaluate()
    return subscribeCookieConsent(evaluate)
  }, [slot])

  useEffect(() => {
    if (!visible) return
    const client = getAdNetworkClientId()
    const unit = getAdSlotUnitId(slot)
    if (!client || !unit) return

    const w = window as Window & { adsbygoogle?: unknown[] }
    w.adsbygoogle = w.adsbygoogle || []
    try {
      w.adsbygoogle.push({})
    } catch {
      /* red no cargada aún */
    }
  }, [visible, slot])

  if (!visible) return null

  const client = getAdNetworkClientId()
  const unit = getAdSlotUnitId(slot)

  return (
    <aside
      className={`qvh-ad-slot ${className}`.trim()}
      data-ad-slot={slot}
      aria-label={config.label}
      style={{ minHeight: config.minHeightPx }}
    >
      {client && unit ? (
        <ins
          className="adsbygoogle block w-full"
          style={{ display: "block", minHeight: config.minHeightPx }}
          data-ad-client={client}
          data-ad-slot={unit}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      ) : config.placeholder ? (
        <div className="qvh-ad-placeholder" role="presentation">
          <span className="qvh-ad-placeholder-label">{config.label}</span>
          <span className="qvh-ad-placeholder-hint">
            Slot listo · activar NEXT_PUBLIC_ADS_ENABLED=1
          </span>
        </div>
      ) : null}
    </aside>
  )
}
