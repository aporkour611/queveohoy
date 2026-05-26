"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => setUser(data.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setLoaded(true));
  }, []);

  if (!loaded) return null;

  if (user) {
    return (
      <Link href="/cuenta" className="fh-nav-account">
        <UserIcon />
        Mi cuenta
      </Link>
    );
  }

  return (
    <span className="fh-nav-auth-guest">
      <Link href="/entrar">Inicia sesión</Link>
      <span className="fh-nav-auth-sep" aria-hidden>
        /
      </span>
      <Link href="/registro">Regístrate</Link>
    </span>
  );
}
