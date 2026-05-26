"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signOutAction } from "../lib/auth-actions";
import { useAuth, type AuthUser } from "../lib/auth-context";

const ACCOUNT_LINKS = [
  { href: "/cuenta/favoritos", label: "Favoritos" },
  { href: "/cuenta", label: "Gestionar" },
  { href: "/cuenta/ajustes", label: "Ajustes" },
] as const;

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

function greetingName(name: string) {
  const first = name.trim().split(/\s+/)[0] || name.trim() || "Usuario";
  return first.charAt(0).toUpperCase() + first.slice(1);
}

function AccountUserMenu({ user }: { user: AuthUser }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const name = greetingName(user.displayName);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div
      ref={menuRef}
      className={`fh-nav-account-menu${open ? " is-open" : ""}`}
    >
      <button
        type="button"
        className="fh-nav-account-trigger"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Menú de cuenta de ${name}`}
        onClick={() => setOpen((value) => !value)}
      >
        <UserIcon />
        <span className="fh-nav-account-label">
          Hola, <span className="fh-nav-account-name">{name}</span>
        </span>
      </button>

      <div className="fh-nav-account-dropdown" role="menu">
        <p className="fh-nav-account-dropdown-head fh-nav-account-dropdown-head-mobile">
          Hola, {name}
        </p>
        {ACCOUNT_LINKS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            role="menuitem"
            className="fh-nav-auth-dropdown-item"
            onClick={() => setOpen(false)}
          >
            {item.label}
          </Link>
        ))}
        <form action={signOutAction} className="fh-nav-account-logout-form">
          <button
            type="submit"
            role="menuitem"
            className="fh-nav-auth-dropdown-item fh-nav-auth-dropdown-item-logout"
          >
            Cerrar sesión
          </button>
        </form>
      </div>
    </div>
  );
}

export function AuthNavLink() {
  const { user, loaded } = useAuth();
  const [guestOpen, setGuestOpen] = useState(false);
  const guestMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!guestOpen) return;

    function onPointerDown(event: MouseEvent) {
      if (!guestMenuRef.current?.contains(event.target as Node)) {
        setGuestOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setGuestOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [guestOpen]);

  if (!loaded) return null;

  if (user) {
    return <AccountUserMenu user={user} />;
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

      <div
        className={`fh-nav-auth-menu fh-nav-auth-mobile${guestOpen ? " is-open" : ""}`}
        ref={guestMenuRef}
      >
        <button
          type="button"
          className="fh-nav-auth-trigger"
          aria-expanded={guestOpen}
          aria-haspopup="menu"
          aria-label="Acceder o registrarse"
          onClick={() => setGuestOpen((open) => !open)}
        >
          <UserIcon />
        </button>

        <div className="fh-nav-auth-dropdown" role="menu">
          <Link
            href="/entrar"
            role="menuitem"
            className="fh-nav-auth-dropdown-item"
            onClick={() => setGuestOpen(false)}
          >
            Iniciar sesión
          </Link>
          <Link
            href="/registro"
            role="menuitem"
            className="fh-nav-auth-dropdown-item fh-nav-auth-dropdown-item-primary"
            onClick={() => setGuestOpen(false)}
          >
            Crear cuenta
          </Link>
        </div>
      </div>
    </>
  );
}
