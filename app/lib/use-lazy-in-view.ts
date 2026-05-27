"use client";

import { useEffect, useRef, useState } from "react";

type Options = {
  /** Carga de inmediato (p. ej. primeras tarjetas visibles). */
  eager?: boolean;
  /** Cuánto antes del viewport empezar a cargar. */
  rootMargin?: string;
};

const HAS_INTERSECTION_OBSERVER =
  typeof IntersectionObserver !== "undefined";

/** true cuando el elemento entra (o está cerca) del viewport. */
export function useLazyInView(options: Options = {}) {
  const { eager = false, rootMargin = "200px 0px" } = options;
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(
    () => eager || !HAS_INTERSECTION_OBSERVER
  );

  useEffect(() => {
    if (eager || inView) return;

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
  }, [eager, inView, rootMargin]);

  return { ref, inView };
}
