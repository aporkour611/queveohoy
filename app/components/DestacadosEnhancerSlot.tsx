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
    import("./DestacadosCarouselClient").then((mod) => mod.DestacadosEnhancer),
  { ssr: false }
);

/** Carga el enhancer del carrusel en chunk separado (no bloquea el bundle inicial). */
export function DestacadosEnhancerSlot(props: RowProps) {
  return <DestacadosEnhancer {...props} />;
}
