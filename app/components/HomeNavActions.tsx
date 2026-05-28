"use client";

import dynamic from "next/dynamic";

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

export function HomeNavActions() {
  return (
    <div className="fh-nav-links">
      <PushNavButton />
      <AdminNavLink />
    </div>
  );
}
