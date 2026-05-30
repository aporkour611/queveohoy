"use client";

import { useEffect, useState } from "react";

/** Móvil / touch: carrusel horizontal con swipe en lugar de paginación. */
export function useTouchScrollCarousel(): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const coarse = window.matchMedia("(pointer: coarse)");
    const narrow = window.matchMedia("(max-width: 720px)");

    const sync = () => setEnabled(coarse.matches || narrow.matches);

    sync();
    coarse.addEventListener("change", sync);
    narrow.addEventListener("change", sync);

    return () => {
      coarse.removeEventListener("change", sync);
      narrow.removeEventListener("change", sync);
    };
  }, []);

  return enabled;
}
