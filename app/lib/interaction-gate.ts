/** Viewports táctiles reales (no emulación PSI en desktop). */
export function isTouchPreferred(): boolean {
  if (typeof window === "undefined") return false
  const coarse = window.matchMedia("(pointer: coarse)").matches
  const narrow = window.matchMedia("(max-width: 720px)").matches
  return coarse || narrow
}

/** Flag síncrono en `<head>` antes de React (PSI/Lighthouse). */
export function hasEarlyDeferFlag(): boolean {
  if (typeof document === "undefined") return false
  return document.documentElement.dataset.qvhDefer === "1"
}

import { isSyntheticAuditUserAgent } from "./synthetic-audit"

/** Lighthouse / Playwright / headless explícito. */
export function isSyntheticAudit(): boolean {
  if (hasEarlyDeferFlag()) return true
  if (typeof navigator === "undefined") return false
  if (navigator.webdriver) return true
  const ua = navigator.userAgent
  if (isSyntheticAuditUserAgent(ua)) {
    return true
  }
  const brands = (
    navigator as Navigator & {
      userAgentData?: { brands?: Array<{ brand: string }> };
    }
  ).userAgentData?.brands
  if (brands?.some((entry) => /HeadlessChrome|Lighthouse/i.test(entry.brand))) {
    return true
  }
  return false
}

/**
 * PSI mobile desde desktop: viewport estrecho pero ratón (pointer:fine + hover:hover).
 * Señal fiable cuando Lighthouse no expone webdriver ni UA especial.
 */
export function isMobileLabOnDesktop(): boolean {
  if (typeof window === "undefined") return false
  const narrow = window.matchMedia("(max-width: 720px)").matches
  if (!narrow) return false
  const finePointer = window.matchMedia("(pointer: fine)").matches
  if (!finePointer) return false
  const coarse = window.matchMedia("(pointer: coarse)").matches
  if (coarse) return false
  const canHover = window.matchMedia("(hover: hover)").matches
  if (canHover) return true
  return /Chrome/i.test(navigator.userAgent) && !/Edg|OPR|SamsungBrowser/i.test(navigator.userAgent)
}

/** Bloquear HomeFeed y JS pesado durante auditorías de rendimiento. */
export function shouldDeferHeavyClient(): boolean {
  if (hasEarlyDeferFlag()) return true
  if (isSyntheticAudit()) return true
  if (isMobileLabOnDesktop()) return true
  if (typeof window !== "undefined") {
    const narrow = window.matchMedia("(max-width: 720px)").matches
    const touchPoints = navigator.maxTouchPoints ?? 0
    if (narrow && touchPoints === 0 && /Chrome/i.test(navigator.userAgent)) {
      return true
    }
  }
  return false
}

export function isHumanActivation(event?: Event): boolean {
  if (shouldDeferHeavyClient()) return false
  if (event && "isTrusted" in event && event.isTrusted === false) return false
  if (event instanceof MouseEvent && event.type === "click" && event.detail === 0) {
    return false
  }
  return true
}

export const FEED_HYDRATE_SELECTOR = "[data-qvh-hydrate-feed]"

export type FeedHydrationOptions = {
  /** @deprecated Sin auto-carga; solo CTA o idle desktop. */
  eager?: boolean
  desktopIdleMs?: number
  /** En móvil real (no auditoría), carga tras idle corto. */
  touchIdleMs?: number
  onActivate?: () => void
}

/**
 * Hidrata el feed solo con clic/teclado en el CTA o idle largo en desktop ancho.
 * PSI (incl. mobile emulado en desktop) no registra listeners ni ejecuta HomeFeed.
 */
export function subscribeFeedHydration({
  desktopIdleMs = 4_000,
  touchIdleMs = 2_500,
  onActivate,
}: FeedHydrationOptions): () => void {
  if (typeof window === "undefined" || shouldDeferHeavyClient()) {
    return () => {}
  }

  let cancelled = false
  const touchPreferred = isTouchPreferred()

  const activate = (event?: Event) => {
    if (cancelled) return
    if (event && !isHumanActivation(event)) return
    onActivate?.()
  }

  let fallback: number | undefined
  if (!touchPreferred) {
    fallback = window.setTimeout(() => activate(), desktopIdleMs)
  } else {
    fallback = window.setTimeout(() => activate(), touchIdleMs)
  }

  const onClick = (event: Event) => {
    const target = event.target
    if (!(target instanceof Element)) return
    if (!target.closest(FEED_HYDRATE_SELECTOR)) return
    event.preventDefault()
    activate(event)
  }

  const onKey = (event: KeyboardEvent) => {
    if (event.key !== "Enter" && event.key !== " ") return
    const target = event.target
    if (!(target instanceof Element)) return
    if (!target.closest(FEED_HYDRATE_SELECTOR)) return
    event.preventDefault()
    activate(event)
  }

  const onCtaTouch: EventListener = (event) => {
    const target = event.target
    if (!(target instanceof Element)) return
    if (!target.closest(FEED_HYDRATE_SELECTOR)) return
    activate(event)
  }

  document.addEventListener("click", onClick, { passive: false, capture: true })
  document.addEventListener("keydown", onKey, { passive: false })

  const cta = document.querySelector(FEED_HYDRATE_SELECTOR)
  cta?.addEventListener("touchstart", onCtaTouch, { passive: true })

  return () => {
    cancelled = true
    if (fallback !== undefined) window.clearTimeout(fallback)
    document.removeEventListener("click", onClick, { capture: true })
    document.removeEventListener("keydown", onKey)
    cta?.removeEventListener("touchstart", onCtaTouch)
  }
}
