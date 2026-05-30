"use client"

import { useEffect } from "react"
import { shouldDeferHeavyClient } from "@/app/lib/interaction-gate"

const syncNavbarHeight = () => {
  const shell = document.querySelector<HTMLElement>(".fh-header-shell")
  if (!shell) return

  const height = shell.offsetHeight
  if (height > 0) {
    document.documentElement.style.setProperty("--qvh-navbar-h", `${height}px`)
    window.dispatchEvent(new Event("qvh-navbar-metrics"))
  }
}

/** Alinea `--qvh-navbar-h` tras idle (no bloquea el hilo principal en PSI). */
export const NavbarHeightSync = () => {
  useEffect(() => {
    let observer: ResizeObserver | null = null
    let cancelled = false

    const attach = () => {
      if (cancelled) return
      syncNavbarHeight()

      const shell = document.querySelector<HTMLElement>(".fh-header-shell")
      if (!shell) return

      observer = new ResizeObserver(syncNavbarHeight)
      observer.observe(shell)
      window.addEventListener("resize", syncNavbarHeight, { passive: true })
    }

    if (shouldDeferHeavyClient()) {
      const fallback = window.setTimeout(attach, 60_000)
      return () => {
        cancelled = true
        window.clearTimeout(fallback)
        observer?.disconnect()
        window.removeEventListener("resize", syncNavbarHeight)
      }
    }

    const onInteract = () => attach()
    window.addEventListener("pointerdown", onInteract, { passive: true, once: true })
    window.addEventListener("keydown", onInteract, { passive: true, once: true })

    const fallback = window.setTimeout(attach, 45_000)

    return () => {
      cancelled = true
      window.clearTimeout(fallback)
      window.removeEventListener("pointerdown", onInteract)
      window.removeEventListener("keydown", onInteract)
      observer?.disconnect()
      window.removeEventListener("resize", syncNavbarHeight)
    }
  }, [])

  return null
}
