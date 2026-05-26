"use client";

import { useCallback, useEffect, useState } from "react";

const SHOW_AFTER_PX = 420;

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let frame = 0;

    function sync() {
      setVisible(window.scrollY > SHOW_AFTER_PX);
    }

    function onScroll() {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        sync();
      });
    }

    sync();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  const scrollUp = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <button
      type="button"
      className={`qvh-scroll-top ${visible ? "is-visible" : ""}`}
      onClick={scrollUp}
      aria-label="Volver arriba"
      title="Volver arriba"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 5l-6 6M12 5l6 6M12 5v14"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="qvh-scroll-top-label">Arriba</span>
    </button>
  );
}
