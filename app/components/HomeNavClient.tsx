"use client"

import Link from "next/link"
import { useEffect, useState, type ComponentType, type ReactNode } from "react"
import { isTouchPreferred, shouldDeferHeavyClient } from "@/app/lib/interaction-gate"

const NavActionPlaceholder = () => (
  <span className="fh-nav-action-placeholder" aria-hidden />
)

const syncNavbarHeight = () => {
  const shell = document.querySelector<HTMLElement>(".fh-header-shell")
  if (!shell) return

  const height = shell.offsetHeight
  if (height > 0) {
    document.documentElement.style.setProperty("--qvh-navbar-h", `${height}px`)
    window.dispatchEvent(new Event("qvh-navbar-metrics"))
  }
}

type NavActionsBundle = {
  ThemeToggle: ComponentType
  AccountNavLink: ComponentType
  PushNavButton: ComponentType
  AdminNavLink: ComponentType
}

type Props = {
  logo: ReactNode
}

/** Nav interactivo en un solo boundary (sin next/dynamic preload). */
export function HomeNavClient({ logo }: Props) {
  const [ready, setReady] = useState(false)
  const [actions, setActions] = useState<NavActionsBundle | null>(null)

  useEffect(() => {
    let observer: ResizeObserver | null = null
    let cancelled = false

    const attachNavbarSync = () => {
      if (cancelled) return
      syncNavbarHeight()

      const shell = document.querySelector<HTMLElement>(".fh-header-shell")
      if (!shell) return

      observer = new ResizeObserver(syncNavbarHeight)
      observer.observe(shell)
      window.addEventListener("resize", syncNavbarHeight, { passive: true })
    }

    if (shouldDeferHeavyClient()) {
      const fallback = window.setTimeout(attachNavbarSync, 60_000)
      return () => {
        cancelled = true
        window.clearTimeout(fallback)
        observer?.disconnect()
        window.removeEventListener("resize", syncNavbarHeight)
      }
    }

    const onInteract = () => attachNavbarSync()
    window.addEventListener("pointerdown", onInteract, { passive: true, once: true })
    window.addEventListener("keydown", onInteract, { passive: true, once: true })

    const fallback = window.setTimeout(attachNavbarSync, 45_000)

    return () => {
      cancelled = true
      window.clearTimeout(fallback)
      window.removeEventListener("pointerdown", onInteract)
      window.removeEventListener("keydown", onInteract)
      observer?.disconnect()
      window.removeEventListener("resize", syncNavbarHeight)
    }
  }, [])

  useEffect(() => {
    if (shouldDeferHeavyClient()) return

    let cancelled = false
    const activate = () => {
      if (cancelled) return
      setReady(true)
      void Promise.all([
        import("./ThemeToggle"),
        import("./AccountNavLink"),
        import("./PushNotifications"),
        import("./AdminNavLink"),
      ]).then(([theme, account, push, admin]) => {
        if (cancelled) return
        setActions({
          ThemeToggle: theme.ThemeToggle,
          AccountNavLink: account.AccountNavLink,
          PushNavButton: push.PushNavButton,
          AdminNavLink: admin.AdminNavLink,
        })
      })
    }

    const nav = document.querySelector(".fh-nav-links")
    const onNavClick = (event: Event) => {
      if (!nav?.contains(event.target as Node)) return
      activate()
    }

    nav?.addEventListener("click", onNavClick, { passive: true, once: true })

    let idleFallback: number | undefined
    if (!isTouchPreferred()) {
      idleFallback = window.setTimeout(activate, 12_000)
    }

    return () => {
      cancelled = true
      if (idleFallback !== undefined) window.clearTimeout(idleFallback)
      nav?.removeEventListener("click", onNavClick)
    }
  }, [])

  return (
    <>
      <div className="fh-header-depth" aria-hidden />
      <nav
        className="fh-navbar fh-navbar-elevated fh-navbar-volumetric"
        aria-label="Navegación principal"
      >
        <div className="fh-navbar-inner">
          {logo}
          <div className="fh-nav-links">
            <Link href="/explorar" className="fh-nav-explorar-link">
              Explorar
            </Link>
            {ready && actions ? (
              (() => {
                const {
                  ThemeToggle,
                  AccountNavLink,
                  PushNavButton,
                  AdminNavLink,
                } = actions
                return (
                  <>
                    <ThemeToggle />
                    <AccountNavLink />
                    <PushNavButton />
                    <AdminNavLink />
                  </>
                )
              })()
            ) : (
              <>
                <NavActionPlaceholder />
                <NavActionPlaceholder />
                <NavActionPlaceholder />
                <NavActionPlaceholder />
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  )
}
