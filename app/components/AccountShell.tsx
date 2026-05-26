"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { AdminNavLink } from "./AdminNavLink";
import { AuthNavLink } from "./AuthNavLink";
import { signOutAction } from "../lib/auth-actions";

const ACCOUNT_NAV = [
  { href: "/cuenta", label: "Resumen", description: "Tu perfil" },
  { href: "/cuenta/favoritos", label: "Favoritos", description: "Lo que guardaste" },
  { href: "/cuenta/ajustes", label: "Ajustes", description: "Preferencias" },
] as const;

type Props = {
  displayName: string;
  email?: string | null;
  children: React.ReactNode;
};

export function AccountShell({ displayName, email, children }: Props) {
  const pathname = usePathname();

  return (
    <div className="fh-body">
      <nav className="fh-navbar">
        <div className="fh-navbar-inner fh-navbar-inner-auth">
          <Logo />
          <div className="fh-nav-links">
            <AuthNavLink />
            <AdminNavLink />
          </div>
        </div>
      </nav>

      <main className="fh-auth-page">
        <div className="fh-container fh-account-page">
          <div className="fh-account-layout">
            <aside className="fh-account-sidebar">
              <div className="fh-account-sidebar-head">
                <p className="fh-account-sidebar-kicker">Gestionar cuenta</p>
                <p className="fh-account-sidebar-name">{displayName}</p>
                {email ? (
                  <p className="fh-account-sidebar-email">{email}</p>
                ) : null}
              </div>

              <nav className="fh-account-menu" aria-label="Secciones de cuenta">
                {ACCOUNT_NAV.map((item) => {
                  const active =
                    item.href === "/cuenta"
                      ? pathname === "/cuenta"
                      : pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`fh-account-menu-item${active ? " active" : ""}`}
                      aria-current={active ? "page" : undefined}
                    >
                      <span className="fh-account-menu-label">{item.label}</span>
                      <span className="fh-account-menu-desc">{item.description}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="fh-account-sidebar-foot">
                <Link href="/" className="fh-account-menu-link">
                  Ver eventos de hoy
                </Link>
                <form action={signOutAction}>
                  <button type="submit" className="fh-account-menu-link fh-account-logout">
                    Cerrar sesión
                  </button>
                </form>
              </div>
            </aside>

            <div className="fh-account-main fh-auth-card">{children}</div>
          </div>
        </div>
      </main>
    </div>
  );
}
