"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

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
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(eager);

  useEffect(() => {
    if (eager || visible) return;

    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [eager, visible]);

  return (
    <div
      ref={ref}
      className={visible ? undefined : "fh-lazy-mount"}
      style={visible ? undefined : { minHeight }}
    >
      {visible ? children : null}
    </div>
  );
}
