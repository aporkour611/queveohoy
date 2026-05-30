/** Viewports donde PSI mobile debe evitar timers idle que cargan JS. */
export function isTouchPreferred(): boolean {
  if (typeof window === "undefined") return false
  const coarse = window.matchMedia("(pointer: coarse)").matches
  const narrow = window.matchMedia("(max-width: 720px)").matches
  return coarse || narrow
}

export type InteractionGateOptions = {
  eager?: boolean
  desktopIdleMs?: number
  onActivate?: () => void
}

/** Activa tras interacción real; en desktop permite idle corto. Sin scroll (PSI lo dispara). */
export function subscribeInteractionGate({
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

  const onInteract = () => activate()

  window.addEventListener("pointerdown", onInteract, { passive: true, once: true })
  window.addEventListener("touchstart", onInteract, { passive: true, once: true })
  window.addEventListener("keydown", onInteract, { passive: true, once: true })

  return () => {
    cancelled = true
    if (fallback !== undefined) window.clearTimeout(fallback)
    window.removeEventListener("pointerdown", onInteract)
    window.removeEventListener("touchstart", onInteract)
    window.removeEventListener("keydown", onInteract)
  }
}
