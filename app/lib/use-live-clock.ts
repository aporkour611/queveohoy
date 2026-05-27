"use client";

import { useEffect, useState } from "react";

/** Reloj que se actualiza para detectar eventos en directo en la UI. */
export function useLiveClock(intervalMs = 45_000): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const tick = () => setNow(new Date());
    const id = window.setInterval(tick, intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);

  return now;
}
