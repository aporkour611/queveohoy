"use client";

import { useEffect, useState } from "react";

/** Evita mismatch SSR/client en UI que depende de la hora actual. */
export function useClientMounted(): boolean {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
