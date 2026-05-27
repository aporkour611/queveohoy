"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { partidosHoyDatePath } from "../lib/seo-date";
import { buildDisplayDays, MADRID_TZ } from "../lib/timezone";
import { FEED_DAY_COUNT } from "../lib/events-feed";
import type { TodayStats } from "../lib/home-stats";

type Props = {
  fetchedAt?: string | null;
  stats: TodayStats;
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

export function HomeCalendarHero({ fetchedAt, stats }: Props) {
  const [, setTick] = useState(0);
  const today = buildDisplayDays(MADRID_TZ, FEED_DAY_COUNT)[0];

  useEffect(() => {
    if (!fetchedAt) return;
    const timer = window.setInterval(() => {
      setTick((value) => value + 1);
    }, 60_000);
    return () => window.clearInterval(timer);
  }, [fetchedAt]);

  const updatedLabel = fetchedAt ? formatUpdatedLabel(fetchedAt) : null;

  const eventLabel =
    stats.total === 0
      ? "Sin eventos hoy"
      : stats.total === 1
        ? "1 evento hoy"
        : `${stats.total} eventos hoy`;

  return (
    <header className="qvh-calendar-hero">
      <p className="qvh-calendar-hero-kicker">
        Calendario semanal · TV, deportes y estrenos
      </p>
      <h1 className="qvh-calendar-hero-title">Qué ver hoy en TV</h1>

      <div className="qvh-calendar-hero-stats" aria-live="polite">
        {today ? (
          <span className="qvh-calendar-stat qvh-calendar-stat-day">
            {today.title}
          </span>
        ) : null}
        <span className="qvh-calendar-stat qvh-calendar-stat-count">
          {eventLabel}
        </span>
        {stats.freeCount > 0 ? (
          <span className="qvh-calendar-stat qvh-calendar-stat-free">
            {stats.freeCount === 1
              ? "1 en abierto"
              : `${stats.freeCount} en abierto`}
          </span>
        ) : null}
      </div>

      <p className="qvh-calendar-hero-lead">
        {stats.total > 0 ? (
          <>
            Partidos, deportes y estrenos de <strong>{stats.dayTitle}</strong>{" "}
            con horario y canal en un vistazo.
          </>
        ) : (
          <>
            Hoy es <strong>{stats.dayTitle}</strong> — consulta otros días en
            las pestañas o la semana completa.
          </>
        )}
      </p>

      <div className="qvh-hero-ctas">
        <Link
          href={today ? partidosHoyDatePath(today.date) : "/partidos-hoy"}
          className="qvh-hero-cta-primary"
        >
          Partidos hoy en TV →
        </Link>
        <Link href="/champions" className="qvh-hero-cta-secondary">
          Champions
        </Link>
        <Link href="/laliga" className="qvh-hero-cta-secondary">
          LaLiga
        </Link>
      </div>

      {updatedLabel ? (
        <p className="qvh-calendar-hero-updated" aria-live="polite">
          {updatedLabel}
        </p>
      ) : null}
    </header>
  );
}
