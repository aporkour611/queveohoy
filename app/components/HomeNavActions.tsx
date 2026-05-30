"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import { isSyntheticAudit, isTouchPreferred } from "@/app/lib/interaction-gate";

const NavActionPlaceholder = () => (
  <span className="fh-nav-action-placeholder" aria-hidden />
);

const AdminNavLink = dynamic(
  () => import(/* webpackPrefetch: false */ "./AdminNavLink").then((mod) => mod.AdminNavLink),
  { ssr: false, loading: NavActionPlaceholder }
);

const PushNavButton = dynamic(
  () => import(/* webpackPrefetch: false */ "./PushNotifications").then((mod) => mod.PushNavButton),
  { ssr: false, loading: NavActionPlaceholder }
);

const AccountNavLink = dynamic(
  () => import(/* webpackPrefetch: false */ "./AccountNavLink").then((mod) => mod.AccountNavLink),
  { ssr: false, loading: NavActionPlaceholder }
);

const ThemeToggle = dynamic(
  () => import(/* webpackPrefetch: false */ "./ThemeToggle").then((mod) => mod.ThemeToggle),
  { ssr: false, loading: NavActionPlaceholder }
);

export function HomeNavActions() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (isSyntheticAudit()) return;

    let cancelled = false;
    const activate = () => {
      if (!cancelled) setReady(true);
    };

    const nav = document.querySelector(".fh-nav-links");
    const onNavClick = (event: Event) => {
      if (!nav?.contains(event.target as Node)) return;
      activate();
    };

    nav?.addEventListener("click", onNavClick, { passive: true, once: true });

    let fallback: number | undefined;
    if (!isTouchPreferred()) {
      fallback = window.setTimeout(activate, 3_000);
    }

    return () => {
      cancelled = true;
      if (fallback !== undefined) window.clearTimeout(fallback);
      nav?.removeEventListener("click", onNavClick);
    };
  }, []);

  return (
    <div className="fh-nav-links">
      <Link href="/explorar" className="fh-nav-explorar-link">
        Explorar
      </Link>
      {ready ? (
        <>
          <ThemeToggle />
          <AccountNavLink />
          <PushNavButton />
          <AdminNavLink />
        </>
      ) : (
        <>
          <NavActionPlaceholder />
          <NavActionPlaceholder />
          <NavActionPlaceholder />
          <NavActionPlaceholder />
        </>
      )}
    </div>
  );
}
