"use client";

import dynamic from "next/dynamic";
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

/** Montado solo tras FeedClientRoots (gate externo). */
export function DestacadosEnhancerSlot(props: RowProps) {
  return <DestacadosEnhancer {...props} />;
}
