"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { subscribeFeedScopedGate } from "@/app/lib/interaction-gate";
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

export function DestacadosEnhancerSlot(props: RowProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    return subscribeFeedScopedGate({
      desktopIdleMs: 2_000,
      onActivate: () => setReady(true),
    });
  }, []);

  if (!ready) return null;

  return <DestacadosEnhancer {...props} />;
}
