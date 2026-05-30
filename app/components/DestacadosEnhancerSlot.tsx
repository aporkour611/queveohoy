"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { subscribeInteractionGate } from "@/app/lib/interaction-gate";
import type { EventRow } from "./types";

type RowProps = {
  title: string;
  subtitle: string;
  items: EventRow[];
  ariaLabel: string;
  className?: string;
};

const DestacadosEnhancer = dynamic(
  () =>
    import(/* webpackPrefetch: false */ "./DestacadosCarouselClient").then(
      (mod) => mod.DestacadosEnhancer
    ),
  { ssr: false, loading: () => null }
);

/** Carrusel interactivo — solo tras interacción (no en PSI mobile). */
export function DestacadosEnhancerSlot(props: RowProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    return subscribeInteractionGate({
      desktopIdleMs: 2_000,
      onActivate: () => setReady(true),
    });
  }, []);

  if (!ready) return null;

  return <DestacadosEnhancer {...props} />;
}
