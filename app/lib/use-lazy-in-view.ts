"use client";

import { useEffect, useRef, useState } from "react";

type Options = {
  /** Carga de inmediato (p. ej. primeras tarjetas visibles). */
  eager?: boolean;
  /** Cuánto antes del viewport empezar a cargar. */
  rootMargin?: string;
};

/** true cuando el elemento entra (o está cerca) del viewport. */
export function useLazyInView(options: Options = {}) {
  const { eager = false, rootMargin = "200px 0px" } = options;
  const ref = useRef<HTMLDivElement>(null);
  // SSR y primer paint: solo eager. Evita hidratar cientos de <img> fuera de pantalla.
  const supportsObserver = typeof IntersectionObserver !== "undefined";
  const [inView, setInView] = useState(() => eager || !supportsObserver);

  useEffect(() => {
    if (eager || inView || !supportsObserver) return;

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [eager, inView, rootMargin, supportsObserver]);

  return { ref, inView };
}
