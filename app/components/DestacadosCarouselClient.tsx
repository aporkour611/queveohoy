"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { shouldDeferHeavyClient } from "@/app/lib/interaction-gate";
import type { EventRow } from "./types";
import { useTouchScrollCarousel } from "../lib/use-touch-scroll-carousel";

const DestacadosCarousel = dynamic(
  () =>
    import("./DestacadosCarousel").then((mod) => mod.DestacadosCarousel),
  { ssr: false }
);

const FeaturedEventCard = dynamic(
  () =>
    import("./FeaturedEventCard").then((mod) => mod.FeaturedEventCard),
  { ssr: false }
);

type RowProps = {
  title: string;
  subtitle: string;
  items: EventRow[];
  ariaLabel: string;
  className?: string;
};

/** Sustituye la fila estática por el carrusel tras interacción explícita. */
export function DestacadosEnhancer(props: RowProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (shouldDeferHeavyClient()) return;

    let cancelled = false;
    const activate = () => {
      if (!cancelled) setReady(true);
    };

    const cta = document.querySelector("[data-qvh-hydrate-feed]");
    cta?.addEventListener("click", activate, { passive: true, once: true });

    let fallback: number | undefined;
    if (!window.matchMedia("(max-width: 720px)").matches) {
      fallback = window.setTimeout(activate, 12_000);
    }

    return () => {
      cancelled = true;
      if (fallback !== undefined) window.clearTimeout(fallback);
    };
  }, []);

  if (!ready) return null;

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: ".qvh-destacados-static{display:none!important}",
        }}
      />
      <DestacadosCarouselClient {...props} />
    </>
  );
}

function DestacadosCarouselClient({
  title,
  subtitle,
  items,
  ariaLabel,
  className,
}: RowProps) {
  const touchScroll = useTouchScrollCarousel();

  if (items.length === 0) return null;

  return (
    <section
      className={`qvh-destacados qvh-destacados-enhanced${className ? ` ${className}` : ""}`}
      aria-label={ariaLabel}
    >
      <div className="qvh-destacados-head">
        <div className="qvh-destacados-brand">
          <span className="qvh-destacados-dot" aria-hidden />
          <div>
            <h2 className="qvh-destacados-title">{title}</h2>
            <p className="qvh-destacados-sub">{subtitle}</p>
          </div>
        </div>
      </div>

      <DestacadosCarousel
        ariaLabel={ariaLabel}
        layout={touchScroll ? "scroll" : "paginated"}
      >
        {items.map((event, index) => (
          <FeaturedEventCard
            key={event.id}
            event={event}
            priority={index === 0}
          />
        ))}
      </DestacadosCarousel>
    </section>
  );
}
