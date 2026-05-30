"use client";

import { useEffect, useMemo, useState } from "react";
import { madridDateTimeToUtc } from "../lib/madrid-time";

type Props = {
  date: string;
  time?: string | null;
  className?: string;
  liveLabel?: string;
  compact?: boolean;
};

type CountdownParts = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function computeRemaining(targetMs: number): CountdownParts | null {
  const diff = targetMs - Date.now();
  if (diff <= 0) return null;

  const totalSeconds = Math.floor(diff / 1000);
  return {
    days: Math.floor(totalSeconds / 86_400),
    hours: Math.floor((totalSeconds % 86_400) / 3_600),
    minutes: Math.floor((totalSeconds % 3_600) / 60),
    seconds: totalSeconds % 60,
  };
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function CountdownUnit({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="qvh-countdown-unit">
      <span className="qvh-countdown-digit" key={value}>
        {value}
      </span>
      <span className="qvh-countdown-label">{label}</span>
    </div>
  );
}

export function EventCountdown({
  date,
  time,
  className = "",
  liveLabel = "¡Ya!",
  compact = false,
}: Props) {
  const targetMs = useMemo(
    () => madridDateTimeToUtc(date, time?.trim() || "00:00").getTime(),
    [date, time]
  );
  const [parts, setParts] = useState<CountdownParts | null>(() =>
    computeRemaining(targetMs)
  );

  useEffect(() => {
    const tick = () => setParts(computeRemaining(targetMs));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [targetMs]);

  if (!parts) {
    return (
      <p
        className={`qvh-countdown qvh-countdown-live ${compact ? "qvh-countdown-compact " : ""}${className}`.trim()}
        role="status"
      >
        {liveLabel}
      </p>
    );
  }

  const showDays = parts.days > 0;
  const rootClass = [
    "qvh-countdown",
    compact ? "qvh-countdown-compact" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={rootClass}
      role="timer"
      aria-live="polite"
      aria-label={`Comienza en ${parts.days} días, ${parts.hours} horas, ${parts.minutes} minutos y ${parts.seconds} segundos`}
    >
      {!compact ? (
        <span className="qvh-countdown-kicker">Comienza en</span>
      ) : null}
      <div className="qvh-countdown-grid">
        {showDays ? (
          <CountdownUnit label={compact ? "d" : "días"} value={String(parts.days)} />
        ) : null}
        <CountdownUnit label="h" value={pad(parts.hours)} />
        {!compact ? (
          <span className="qvh-countdown-sep" aria-hidden>
            :
          </span>
        ) : null}
        <CountdownUnit label="m" value={pad(parts.minutes)} />
        {!compact ? (
          <span className="qvh-countdown-sep" aria-hidden>
            :
          </span>
        ) : null}
        <CountdownUnit label="s" value={pad(parts.seconds)} />
      </div>
    </div>
  );
}
