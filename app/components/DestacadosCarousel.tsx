"use client";

import { useRef, useState } from "react";
import type { EventRow } from "./types";
import {
  DESTACADOS_SCROLL_STEP,
  DESTACADOS_VISIBLE_SLOTS,
} from "../lib/destacados-config";
import { FeaturedEventCard } from "./FeaturedEventCard";

type Props = {
  items: EventRow[];
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
  items,
  ariaLabel,
  layout = "paginated",
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const pageSize = DESTACADOS_SCROLL_STEP;
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const listKey = items.map((item) => item.id).join(",");
  const [pageByList, setPageByList] = useState<Record<string, number>>({});
  const page = Math.min(pageByList[listKey] ?? 0, pageCount - 1);
  const setPage = (next: number) => {
    setPageByList((current) => ({
      ...current,
      [listKey]: Math.max(0, Math.min(next, pageCount - 1)),
    }));
  };
  const showNav = items.length > DESTACADOS_VISIBLE_SLOTS;
  const start = page * pageSize;
  const visible = items.slice(start, start + pageSize);

  function scrollByDirection(direction: -1 | 1) {
    const el = scrollRef.current;
    if (!el) return;

    const card = el.querySelector(".qvh-spotlight-card") as HTMLElement | null;
    const gap = 12;
    const cardWidth = card?.offsetWidth ?? 236;
    const step = (cardWidth + gap) * DESTACADOS_SCROLL_STEP;

    el.scrollBy({
      left: direction * step,
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
          {items.map((event, index) => (
            <FeaturedEventCard
              key={event.id}
              event={event}
              priority={index < 2}
            />
          ))}
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
          disabled={page === 0}
          onClick={() => setPage(page - 1)}
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
          onClick={() => setPage(page + 1)}
        >
          <ChevronIcon direction="right" />
        </button>
      ) : null}
    </div>
  );
}
