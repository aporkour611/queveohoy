"use client"

import { useEffect, useRef } from "react"

/** Focus trap básico para drawer de evento (v19). */
export function useFocusTrap(active: boolean) {
  const containerRef = useRef<HTMLElement | null>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!active) return

    previousFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null

    const root = containerRef.current
    if (!root) return

    const focusables = root.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const first = focusables[0]
    first?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab" || focusables.length === 0) return

      const list = Array.from(focusables)
      const current = document.activeElement as HTMLElement
      const index = list.indexOf(current)

      if (event.shiftKey) {
        if (index <= 0) {
          event.preventDefault()
          list[list.length - 1]?.focus()
        }
        return
      }

      if (index === list.length - 1) {
        event.preventDefault()
        list[0]?.focus()
      }
    }

    root.addEventListener("keydown", handleKeyDown)
    return () => {
      root.removeEventListener("keydown", handleKeyDown)
      previousFocusRef.current?.focus()
    }
  }, [active])

  return containerRef
}
