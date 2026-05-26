"use client";

import { useEffect, useState } from "react";
import { useTimezone } from "../lib/timezone-context";
import { buildDisplayDays } from "../lib/timezone";
import { FEED_DAY_COUNT } from "../lib/events-feed";

type Props = {
  fetchedAt?: string | null;
};

function formatUpdatedLabel(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.max(0, Math.floor(diffMs / 60_000));
  if (mins < 1) return "Actualizado hace un momento";
  if (mins < 60) return `Actualizado hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Actualizado hace ${hours} h`;
  return `Actualizado ${new Date(iso).toLocaleString("es-ES", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

export function HomeCalendarHero({ fetchedAt }: Props) {
  const { timeZone } = useTimezone();
  const [updatedLabel, setUpdatedLabel] = useState<string | null>(null);

  const today = buildDisplayDays(timeZone, FEED_DAY_COUNT)[0];

  useEffect(() => {
    if (!fetchedAt) return;
    setUpdatedLabel(formatUpdatedLabel(fetchedAt));
    const timer = window.setInterval(() => {
      setUpdatedLabel(formatUpdatedLabel(fetchedAt));
    }, 60_000);
    return () => window.clearInterval(timer);
  }, [fetchedAt]);

  return (
    <header className="qvh-calendar-hero">
      <p className="qvh-calendar-hero-kicker">
        Calendario semanal · TV, deportes y estrenos
      </p>
      <h1 className="qvh-calendar-hero-title">Qué ver hoy</h1>
      <p className="qvh-calendar-hero-lead">
        {today ? (
          <>
            Hoy es <strong>{today.title}</strong> — los eventos más importantes
            y dónde verlos, en un vistazo.
          </>
        ) : (
          <>Los eventos más importantes de la semana y dónde verlos.</>
        )}
      </p>
      {updatedLabel ? (
        <p className="qvh-calendar-hero-updated" aria-live="polite">
          {updatedLabel}
        </p>
      ) : null}
    </header>
  );
}
