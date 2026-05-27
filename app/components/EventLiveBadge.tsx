"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { EventRow } from "./types";
import { getFreeLiveBroadcast } from "../lib/event-live";
import { useLiveClock } from "../lib/use-live-clock";

type Props = {
  event: EventRow;
  variant?: "match" | "spotlight";
  /** Ruta interna de retransmisión (prioritaria sobre enlace externo). */
  watchPath?: string;
};

export function EventLiveBadge({
  event,
  variant = "match",
  watchPath,
}: Props) {
  const now = useLiveClock();
  const live = useMemo(
    () => getFreeLiveBroadcast(event, now),
    [event, now]
  );

  if (!live) return null;

  const className = `qvh-live-badge qvh-live-badge--${variant}`;

  const content = (
    <>
      <span className="qvh-live-dot" aria-hidden />
      <span className="qvh-live-label">En directo</span>
      <span className="qvh-live-channel">{live.channel}</span>
    </>
  );

  if (watchPath) {
    return (
      <Link
        href={watchPath}
        className={className}
        title={`Ver retransmisión en ${live.channel}`}
        onClick={(clickEvent) => clickEvent.stopPropagation()}
      >
        {content}
      </Link>
    );
  }

  if (live.watchUrl) {
    return (
      <a
        href={live.watchUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        title={`Ver en directo en ${live.channel}`}
        onClick={(clickEvent) => clickEvent.stopPropagation()}
      >
        {content}
      </a>
    );
  }

  return (
    <div className={className} title={`En directo · ${live.channel}`}>
      {content}
    </div>
  );
}
