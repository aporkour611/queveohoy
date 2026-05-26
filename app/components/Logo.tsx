"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  variant?: "header" | "full";
  /** En la home: scroll arriba y recargar eventos en lugar de navegar */
  onHomeClick?: () => void;
};

/** Logo de marca: iconos QVH + wordmark (imagen oficial en /logo-queveohoy.png) */
export function Logo({ variant = "header", onHomeClick }: Props) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (isHome && onHomeClick) {
      e.preventDefault();
      onHomeClick();
    }
  }

  if (variant === "full") {
    return (
      <Link
        href="/"
        className="qvh-logo-link qvh-logo-link--full"
        onClick={handleClick}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-queveohoy.png"
          alt="Qué veo hoy — queveohoy.es"
          className="qvh-logo-img-full"
        />
      </Link>
    );
  }

  return (
    <Link
      href="/"
      className="qvh-logo-link"
      aria-label="Qué veo hoy — Inicio"
      onClick={handleClick}
    >
      <span className="qvh-logo-tiles" aria-hidden>
        <span className="qvh-tile qvh-tile-q">Q</span>
        <span className="qvh-tile qvh-tile-v">V</span>
        <span className="qvh-tile qvh-tile-h">H</span>
      </span>
      <span className="qvh-logo-wordmark">
        <span className="qvh-wm qvh-wm-q">que</span>
        <span className="qvh-wm qvh-wm-v">veo</span>
        <span className="qvh-wm qvh-wm-h">hoy</span>
      </span>
    </Link>
  );
}
