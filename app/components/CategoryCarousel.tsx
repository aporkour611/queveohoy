"use client";

import { Children, startTransition, useState, type ReactNode } from "react";

export const CATEGORY_CAROUSEL_VISIBLE_SLOTS = 3;

type Props = {
  children: ReactNode;
  ariaLabel: string;
  visibleSlots?: number;
  className?: string;
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

/** Carrusel paginado por categoría: muestra N ítems populares y flechas para navegar. */
export function CategoryCarousel({
  children,
  ariaLabel,
  visibleSlots = CATEGORY_CAROUSEL_VISIBLE_SLOTS,
  className = "",
}: Props) {
  const childArray = Children.toArray(children);
  const pageSize = visibleSlots;
  const pageCount = Math.max(1, Math.ceil(childArray.length / pageSize));
  const [page, setPageState] = useState(0);
  const clampedPage = Math.min(page, pageCount - 1);

  const setPage = (next: number) => {
    startTransition(() =>
      setPageState(Math.max(0, Math.min(next, pageCount - 1)))
    );
  };

  const showNav = childArray.length > visibleSlots;
  const canGoPrev = clampedPage > 0;
  const canGoNext = clampedPage < pageCount - 1;
  const start = clampedPage * pageSize;
  const visible = childArray.slice(start, start + pageSize);

  const rootClass = ["qvh-category-carousel", className].filter(Boolean).join(" ");

  return (
    <div className={rootClass}>
      {showNav && canGoPrev ? (
        <button
          type="button"
          className="qvh-destacados-nav qvh-destacados-nav-prev"
          aria-label={`Ver anteriores de ${ariaLabel}`}
          onClick={() => setPage(clampedPage - 1)}
        >
          <ChevronIcon direction="left" />
        </button>
      ) : null}

      <div className="qvh-category-carousel-page" aria-label={ariaLabel}>
        {visible}
      </div>

      {showNav && canGoNext ? (
        <button
          type="button"
          className="qvh-destacados-nav qvh-destacados-nav-next"
          aria-label={`Ver siguientes de ${ariaLabel}`}
          onClick={() => setPage(clampedPage + 1)}
        >
          <ChevronIcon direction="right" />
        </button>
      ) : null}
    </div>
  );
}
