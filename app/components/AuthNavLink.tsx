"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type AuthUser = {
  id: string;
  email: string | null;
  displayName: string;
};

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
    return <Link href="/cuenta">Mi cuenta</Link>;
  }

  return <Link href="/entrar">Entrar</Link>;
}
