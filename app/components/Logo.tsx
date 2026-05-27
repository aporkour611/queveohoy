"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LogoMark } from "./LogoMark"

type Props = {
  variant?: "header" | "full"
  /** En la home: scroll arriba y recargar eventos en lugar de navegar */
  onHomeClick?: () => void
}

/** Logo de marca unificado (SVG) */
export function Logo({ variant = "header", onHomeClick }: Props) {
  const pathname = usePathname()
  const isHome = pathname === "/"

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (isHome && onHomeClick) {
      e.preventDefault()
      onHomeClick()
    }
  }

  return (
    <Link
      href="/"
      className={
        variant === "full"
          ? "qvh-logo-link qvh-logo-link--full"
          : "qvh-logo-link"
      }
      aria-label="Qué veo hoy — Inicio"
      onClick={handleClick}
    >
      <LogoMark
        className={
          variant === "full" ? "qvh-logo-svg qvh-logo-svg--full" : "qvh-logo-svg"
        }
      />
    </Link>
  )
}
