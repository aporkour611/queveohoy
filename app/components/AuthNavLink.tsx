"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type AuthUser = {
  id: string;
  email: string | null;
  displayName: string;
};

function UserIcon() {
  return (
    <svg
      className="fh-nav-user-icon"
      viewBox="0 0 24 24"
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M5 20c0-3.5 3.5-6 7-6s7 2.5 7 6" />
    </svg>
  );
}

export function AuthNavLink() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => setUser(data.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    function onPointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  if (!loaded) return null;

  if (user) {
    return (
      <Link href="/cuenta" className="fh-nav-account" aria-label="Mi cuenta">
        <UserIcon />
        <span className="fh-nav-account-label">Mi cuenta</span>
      </Link>
    );
  }

  return (
    <>
      <span className="fh-nav-auth-guest fh-nav-auth-desktop">
        <Link href="/entrar">Inicia sesión</Link>
        <span className="fh-nav-auth-sep" aria-hidden>
          /
        </span>
        <Link href="/registro">Regístrate</Link>
      </span>

      <div className="fh-nav-auth-menu fh-nav-auth-mobile" ref={menuRef}>
        <button
          type="button"
          className="fh-nav-auth-trigger"
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          aria-label="Acceder o registrarse"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <UserIcon />
        </button>

        {menuOpen ? (
          <div className="fh-nav-auth-dropdown" role="menu">
            <Link
              href="/entrar"
              role="menuitem"
              className="fh-nav-auth-dropdown-item"
              onClick={() => setMenuOpen(false)}
            >
              Iniciar sesión
            </Link>
            <Link
              href="/registro"
              role="menuitem"
              className="fh-nav-auth-dropdown-item fh-nav-auth-dropdown-item-primary"
              onClick={() => setMenuOpen(false)}
            >
              Crear cuenta
            </Link>
          </div>
        ) : null}
      </div>
    </>
  );
}
