"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoMark } from "./LogoMark";
import { useHomeReset } from "./HomeResetContext";

export function HomeLogoLink() {
  const pathname = usePathname();
  const { resetHome } = useHomeReset();
  const isHome = pathname === "/";

  function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
    if (!isHome) return;
    event.preventDefault();
    resetHome();
  }

  return (
    <Link
      href="/"
      className="qvh-logo-link"
      aria-label="Qué veo hoy — Inicio"
      onClick={handleClick}
    >
      <LogoMark className="qvh-logo-svg" />
    </Link>
  );
}
