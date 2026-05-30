"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";

const NavActionPlaceholder = () => (
  <span className="fh-nav-action-placeholder" aria-hidden />
);

const AdminNavLink = dynamic(
  () => import("./AdminNavLink").then((mod) => mod.AdminNavLink),
  { ssr: false, loading: NavActionPlaceholder }
);

const PushNavButton = dynamic(
  () => import("./PushNotifications").then((mod) => mod.PushNavButton),
  { ssr: false, loading: NavActionPlaceholder }
);

const AccountNavLink = dynamic(
  () => import("./AccountNavLink").then((mod) => mod.AccountNavLink),
  { ssr: false, loading: NavActionPlaceholder }
);

const ThemeToggle = dynamic(
  () => import("./ThemeToggle").then((mod) => mod.ThemeToggle),
  { ssr: false, loading: NavActionPlaceholder }
);

export function HomeNavActions() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const activate = () => {
      if (!cancelled) setReady(true);
    };

    const onInteract = () => activate();
    window.addEventListener("pointerdown", onInteract, { passive: true, once: true });
    window.addEventListener("keydown", onInteract, { passive: true, once: true });
    const fallback = window.setTimeout(activate, 10_000);

    return () => {
      cancelled = true;
      window.clearTimeout(fallback);
      window.removeEventListener("pointerdown", onInteract);
      window.removeEventListener("keydown", onInteract);
    };
  }, []);

  if (!ready) return <div className="fh-nav-links" aria-hidden />;

  return (
    <div className="fh-nav-links">
      <Link href="/explorar" className="fh-nav-explorar-link">
        Explorar
      </Link>
      <ThemeToggle />
      <AccountNavLink />
      <PushNavButton />
      <AdminNavLink />
    </div>
  );
}
