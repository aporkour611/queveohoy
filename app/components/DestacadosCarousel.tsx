"use client";

import { useEffect, useState } from "react";
import type { EventRow } from "./types";
import {
  DESTACADOS_SCROLL_STEP,
  DESTACADOS_VISIBLE_SLOTS,
} from "../lib/destacados-config";
import { FeaturedEventCard } from "./FeaturedEventCard";

type Props = {
  items: EventRow[];
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

export function DestacadosCarousel({ items, ariaLabel }: Props) {
  const [page, setPage] = useState(0);
  const pageSize = DESTACADOS_SCROLL_STEP;
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const showNav = items.length > DESTACADOS_VISIBLE_SLOTS;
  const start = page * pageSize;
  const visible = items.slice(start, start + pageSize);

  useEffect(() => {
    setPage(0);
  }, [items]);

  useEffect(() => {
    if (page > pageCount - 1) {
      setPage(Math.max(0, pageCount - 1));
    }
  }, [page, pageCount]);

  return (
    <div className="qvh-destacados-carousel">
      {showNav ? (
        <button
          type="button"
          className="qvh-destacados-nav qvh-destacados-nav-prev"
          aria-label={`Ver destacados anteriores de ${ariaLabel}`}
          disabled={page === 0}
          onClick={() => setPage((current) => Math.max(0, current - 1))}
        >
          <ChevronIcon direction="left" />
        </button>
      ) : null}

      <div className="qvh-destacados-page" aria-label={ariaLabel}>
        {visible.map((event, index) => (
          <FeaturedEventCard
            key={event.id}
            event={event}
            priority={page === 0 && index < 2}
          />
        ))}
      </div>

      {showNav ? (
        <button
          type="button"
          className="qvh-destacados-nav qvh-destacados-nav-next"
          aria-label={`Ver los siguientes ${pageSize} destacados de ${ariaLabel}`}
          disabled={page >= pageCount - 1}
          onClick={() =>
            setPage((current) => Math.min(pageCount - 1, current + 1))
          }
        >
          <ChevronIcon direction="right" />
        </button>
      ) : null}
    </div>
  );
}
