"use client";

import { Children, startTransition, useRef, useState, type ReactNode } from "react";
import {
  DESTACADOS_SCROLL_STEP,
  DESTACADOS_VISIBLE_SLOTS,
} from "../lib/destacados-config";

type Props = {
  children: ReactNode;
  ariaLabel: string;
  layout?: "paginated" | "scroll";
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

export function DestacadosCarousel({
  children,
  ariaLabel,
  layout = "paginated",
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const childArray = Children.toArray(children);
  const pageSize = DESTACADOS_SCROLL_STEP;
  const pageCount = Math.max(1, Math.ceil(childArray.length / pageSize));
  const [page, setPageState] = useState(0);
  const clampedPage = Math.min(page, pageCount - 1);

  const setPage = (next: number) => {
    startTransition(() =>
      setPageState(Math.max(0, Math.min(next, pageCount - 1)))
    );
  };
  const showNav = childArray.length > DESTACADOS_VISIBLE_SLOTS;
  const start = clampedPage * pageSize;
  const visible = childArray.slice(start, start + pageSize);

  function scrollByDirection(direction: -1 | 1) {
    const el = scrollRef.current;
    if (!el) return;

    el.scrollBy({
      left: direction * el.clientWidth * 0.85,
      behavior: "smooth",
    });
  }

  if (layout === "scroll") {
    return (
      <div className="qvh-destacados-carousel qvh-destacados-carousel-scroll">
        {showNav ? (
          <button
            type="button"
            className="qvh-destacados-nav qvh-destacados-nav-prev"
            aria-label={`Desplazar destacados anteriores de ${ariaLabel}`}
            onClick={() => scrollByDirection(-1)}
          >
            <ChevronIcon direction="left" />
          </button>
        ) : null}

        <div
          ref={scrollRef}
          className="qvh-destacados-scroll"
          aria-label={ariaLabel}
        >
          {childArray}
        </div>

        {showNav ? (
          <button
            type="button"
            className="qvh-destacados-nav qvh-destacados-nav-next"
            aria-label={`Desplazar los siguientes destacados de ${ariaLabel}`}
            onClick={() => scrollByDirection(1)}
          >
            <ChevronIcon direction="right" />
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="qvh-destacados-carousel">
      {showNav ? (
        <button
          type="button"
          className="qvh-destacados-nav qvh-destacados-nav-prev"
          aria-label={`Ver destacados anteriores de ${ariaLabel}`}
          disabled={clampedPage === 0}
          onClick={() => setPage(clampedPage - 1)}
        >
          <ChevronIcon direction="left" />
        </button>
      ) : null}

      <div className="qvh-destacados-page" aria-label={ariaLabel}>
        {visible}
      </div>

      {showNav ? (
        <button
          type="button"
          className="qvh-destacados-nav qvh-destacados-nav-next"
          aria-label={`Ver los siguientes ${pageSize} destacados de ${ariaLabel}`}
          disabled={clampedPage >= pageCount - 1}
          onClick={() => setPage(clampedPage + 1)}
        >
          <ChevronIcon direction="right" />
        </button>
      ) : null}
    </div>
  );
}