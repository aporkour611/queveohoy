"use client"

import { useLayoutEffect } from "react"

const syncNavbarHeight = () => {
  const shell = document.querySelector<HTMLElement>(".fh-header-shell")
  if (!shell) return

  const height = shell.offsetHeight
  if (height > 0) {
    document.documentElement.style.setProperty("--qvh-navbar-h", `${height}px`)
    window.dispatchEvent(new Event("qvh-navbar-metrics"))
  }
}

/** Alinea `--qvh-navbar-h` con la altura real del header fijo (sticky del día). */
export const NavbarHeightSync = () => {
  useLayoutEffect(() => {
    syncNavbarHeight()

    const shell = document.querySelector<HTMLElement>(".fh-header-shell")
    if (!shell) return

    const observer = new ResizeObserver(syncNavbarHeight)
    observer.observe(shell)
    window.addEventListener("resize", syncNavbarHeight, { passive: true })

    return () => {
      observer.disconnect()
      window.removeEventListener("resize", syncNavbarHeight)
    }
  }, [])

  return null
}
