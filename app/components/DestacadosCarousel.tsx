"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  DESTACADOS_SCROLL_STEP,
  DESTACADOS_VISIBLE_SLOTS,
} from "../lib/destacados-config";

type Props = {
  children: ReactNode;
  itemCount: number;
  ariaLabel: string;
};

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      className="qvh-destacados-nav-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {direction === "left" ? (
        <path d="M15 6l-6 6 6 6" />
      ) : (
        <path d="M9 6l6 6-6 6" />
      )}
    </svg>
  );
}

export function DestacadosCarousel({ children, itemCount, ariaLabel }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const showNav = itemCount > DESTACADOS_VISIBLE_SLOTS;

  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 6);
    setCanScrollRight(maxScroll - el.scrollLeft > 6);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateArrows();
    el.addEventListener("scroll", updateArrows, { passive: true });
    const observer = new ResizeObserver(updateArrows);
    observer.observe(el);

    return () => {
      el.removeEventListener("scroll", updateArrows);
      observer.disconnect();
    };
  }, [itemCount, updateArrows]);

  const scrollByStep = (direction: -1 | 1) => {
    const el = scrollRef.current;
    if (!el) return;

    const card = el.querySelector<HTMLElement>(".qvh-spotlight-card");
    const gap = 12;
    const step = card
      ? (card.offsetWidth + gap) * DESTACADOS_SCROLL_STEP
      : el.clientWidth * 0.9;

    el.scrollBy({ left: direction * step, behavior: "smooth" });
  };

  return (
    <div className="qvh-destacados-carousel">
      {showNav && (
        <button
          type="button"
          className="qvh-destacados-nav qvh-destacados-nav-prev"
          aria-label={`Ver destacados anteriores de ${ariaLabel}`}
          disabled={!canScrollLeft}
          onClick={() => scrollByStep(-1)}
        >
          <ChevronIcon direction="left" />
        </button>
      )}

      <div
        ref={scrollRef}
        className="qvh-destacados-scroll"
        tabIndex={showNav ? 0 : undefined}
        aria-label={ariaLabel}
      >
        {children}
      </div>

      {showNav && (
        <button
          type="button"
          className="qvh-destacados-nav qvh-destacados-nav-next"
          aria-label={`Ver más destacados de ${ariaLabel}`}
          disabled={!canScrollRight}
          onClick={() => scrollByStep(1)}
        >
          <ChevronIcon direction="right" />
        </button>
      )}
    </div>
  );
}
