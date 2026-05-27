"use client";

import { useLazyInView } from "../lib/use-lazy-in-view";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Altura mínima del hueco mientras no entra en pantalla. */
  minHeight?: number;
  rootMargin?: string;
  /** Si true, monta el contenido de inmediato (p. ej. día activo). */
  eager?: boolean;
};

/** Monta hijos solo cuando están cerca del viewport (menos imágenes a la vez). */
export function LazyMount({
  children,
  minHeight = 200,
  rootMargin = "480px 0px",
  eager = false,
}: Props) {
  const { ref, inView } = useLazyInView({ eager, rootMargin });

  return (
    <div
      ref={ref}
      className={inView ? undefined : "fh-lazy-mount"}
      style={inView ? undefined : { minHeight }}
    >
      {inView ? children : null}
    </div>
  );
}
