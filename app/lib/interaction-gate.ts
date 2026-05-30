/** Viewports donde PSI mobile debe evitar timers idle que cargan JS. */
export function isTouchPreferred(): boolean {
  if (typeof window === "undefined") return false
  const coarse = window.matchMedia("(pointer: coarse)").matches
  const narrow = window.matchMedia("(max-width: 720px)").matches
  return coarse || narrow
}

const FEED_SCOPE_SELECTOR =
  "#feed-controls-ssr, .qvh-home-feed-slot, [data-qvh-feed-activate]"

function isFeedScopedTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false
  return Boolean(target.closest(FEED_SCOPE_SELECTOR))
}

export type InteractionGateOptions = {
  eager?: boolean
  desktopIdleMs?: number
  onActivate?: () => void
}

/**
 * Activa solo con clic/toque dentro del feed o idle en desktop ancho.
 * PSI/Lighthouse hace pointerdown fuera del feed — no debe cargar HomeFeed.
 */
export function subscribeFeedScopedGate({
  eager = false,
  desktopIdleMs = 1_200,
  onActivate,
}: InteractionGateOptions): () => void {
  let cancelled = false
  const touchPreferred = isTouchPreferred()

  const activate = () => {
    if (cancelled) return
    onActivate?.()
  }

  let fallback: number | undefined
  if (eager) {
    fallback = window.setTimeout(activate, 150)
  } else if (!touchPreferred) {
    fallback = window.setTimeout(activate, desktopIdleMs)
  }

  const onPointer = (event: Event) => {
    if (!isFeedScopedTarget(event.target)) return
    activate()
  }

  const onKey = (event: KeyboardEvent) => {
    if (event.key !== "Enter" && event.key !== " ") return
    if (!isFeedScopedTarget(event.target)) return
    activate()
  }

  document.addEventListener("pointerdown", onPointer, { passive: true })
  document.addEventListener("keydown", onKey, { passive: true })

  return () => {
    cancelled = true
    if (fallback !== undefined) window.clearTimeout(fallback)
    document.removeEventListener("pointerdown", onPointer)
    document.removeEventListener("keydown", onKey)
  }
}

/** @deprecated Prefer subscribeFeedScopedGate on home feed paths */
export function subscribeInteractionGate(options: InteractionGateOptions): () => void {
  return subscribeFeedScopedGate(options)
}
