"use client";

import dynamic from "next/dynamic";
import { Logo } from "./Logo";
import { useHomeReset } from "./HomeResetContext";

const AdminNavLink = dynamic(
  () => import("./AdminNavLink").then((mod) => mod.AdminNavLink),
  { ssr: false }
);

const PushNavButton = dynamic(
  () =>
    import("./PushNotifications").then((mod) => mod.PushNavButton),
  { ssr: false }
);

export function HomeNav() {
  const { resetHome } = useHomeReset();

  return (
    <nav className="fh-navbar">
      <div className="fh-navbar-inner">
        <Logo onHomeClick={resetHome} />
        <div className="fh-nav-links">
          <PushNavButton />
          <AdminNavLink />
        </div>
      </div>
    </nav>
  );
}
