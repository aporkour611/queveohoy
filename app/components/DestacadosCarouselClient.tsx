"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { EventRow } from "./types";

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

/** Sustituye la fila estática por el carrusel tras interacción (no scroll/idle de PSI). */
export function DestacadosEnhancer(props: RowProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const activate = () => {
      if (!cancelled) setReady(true);
    };

    const fallback = window.setTimeout(activate, 60_000);

    const onInteract = () => activate();
    window.addEventListener("pointerdown", onInteract, { passive: true, once: true });
    window.addEventListener("keydown", onInteract, { passive: true, once: true });

    return () => {
      cancelled = true;
      window.clearTimeout(fallback);
      window.removeEventListener("pointerdown", onInteract);
      window.removeEventListener("keydown", onInteract);
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

      <DestacadosCarousel ariaLabel={ariaLabel}>
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
