import type { EventRow } from "./types";
import { FeaturedEventCardStatic } from "./FeaturedEventCardStatic";
import { DESTACADOS_VISIBLE_SLOTS } from "../lib/destacados-config";
import { resolveLcpPriorityIndex } from "../lib/home-lcp";

type Props = {
  title: string;
  subtitle: string;
  items: EventRow[];
  ariaLabel: string;
  className?: string;
};

/** Grid SSR visible antes de la hidratación (LCP + SEO). */
export function DestacadosStaticRow({
  title,
  subtitle,
  items,
  ariaLabel,
  className,
}: Props) {
  if (items.length === 0) return null;

  const visible = items.slice(0, DESTACADOS_VISIBLE_SLOTS);
  const lcpIndex = resolveLcpPriorityIndex(visible);

  return (
    <section
      className={`qvh-destacados qvh-destacados-static${className ? ` ${className}` : ""}`}
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

      <div className="qvh-destacados-page qvh-destacados-page-static">
        {visible.map((event, index) => (
          <FeaturedEventCardStatic
            key={event.id}
            event={event}
            priority={index === lcpIndex}
          />
        ))}      </div>
    </section>
  );
}
