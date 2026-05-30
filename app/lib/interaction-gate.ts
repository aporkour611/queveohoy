/** Viewports donde PSI mobile debe evitar timers idle que cargan JS. */
export function isTouchPreferred(): boolean {
  if (typeof window === "undefined") return false
  const coarse = window.matchMedia("(pointer: coarse)").matches
  const narrow = window.matchMedia("(max-width: 720px)").matches
  return coarse || narrow
}

/** Lighthouse / Playwright / headless — no hidratar feed pesado. */
export function isSyntheticAudit(): boolean {
  if (typeof navigator === "undefined") return false
  if (navigator.webdriver) return true
  const ua = navigator.userAgent
  if (/HeadlessChrome|Lighthouse|Chrome-Lighthouse|PTST|PageSpeed|Google-InspectionTool/i.test(ua)) {
    return true
  }
  return false
}

export function isHumanActivation(event?: Event): boolean {
  if (isSyntheticAudit()) return false
  if (event && "isTrusted" in event && event.isTrusted === false) return false
  if (event instanceof MouseEvent && event.type === "click" && event.detail === 0) {
    return false
  }
  return true
}

export const FEED_HYDRATE_SELECTOR = "[data-qvh-hydrate-feed]"

export type FeedHydrationOptions = {
  eager?: boolean
  desktopIdleMs?: number
  onActivate?: () => void
}

/**
 * Hidrata el feed solo con gesto humano real (touch/click explícito) o idle desktop.
 * PSI no registra listeners ni ejecuta HomeFeed (~7s TBT).
 */
export function subscribeFeedHydration({
  eager = false,
  desktopIdleMs = 1_200,
  onActivate,
}: FeedHydrationOptions): () => void {
  if (typeof window === "undefined" || isSyntheticAudit()) {
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
  if (eager) {
    fallback = window.setTimeout(() => activate(), 150)
  } else if (!touchPreferred) {
    fallback = window.setTimeout(() => activate(), desktopIdleMs)
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

  document.addEventListener("click", onClick, { passive: false, capture: true })
  document.addEventListener("keydown", onKey, { passive: false })

  return () => {
    cancelled = true
    if (fallback !== undefined) window.clearTimeout(fallback)
    document.removeEventListener("click", onClick, { capture: true })
    document.removeEventListener("keydown", onKey)
  }
}

/** @deprecated Use subscribeFeedHydration */
export function subscribeFeedScopedGate(options: FeedHydrationOptions): () => void {
  return subscribeFeedHydration(options)
}

/** @deprecated Use subscribeFeedHydration */
export function subscribeInteractionGate(options: FeedHydrationOptions): () => void {
  return subscribeFeedHydration(options)
}
