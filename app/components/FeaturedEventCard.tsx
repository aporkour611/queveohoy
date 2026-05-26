import type { EventRow } from "./types";
import { getSpotlightCardModel } from "../lib/featured-card";

type Props = {
  event: EventRow;
  className?: string;
};

export function FeaturedEventCard({ event, className }: Props) {
  const card = getSpotlightCardModel(event);
  const rootClass = ["qvh-spotlight-card", className].filter(Boolean).join(" ");

  return (
    <article className={rootClass}>
      <div
        className={`qvh-spotlight-visual ${card.visualClass ?? ""}`}
        style={
          card.poster
            ? { backgroundImage: `url(${card.poster})` }
            : undefined
        }
      >
        <div className="qvh-spotlight-overlay" />
        <span
          className={`qvh-spotlight-badge qvh-spotlight-badge-${card.badgeVariant}`}
        >
          {card.badge}
        </span>
        <div className="qvh-spotlight-when">
          <span className="qvh-spotlight-date">{card.dateLabel}</span>
          <span className="qvh-spotlight-time">{card.time}</span>
        </div>
      </div>

      <div className="qvh-spotlight-body">
        <h3 className="qvh-spotlight-headline">{card.headline}</h3>
        {card.meta ? <p className="qvh-spotlight-meta">{card.meta}</p> : null}
        {card.platform ? (
          <p className="qvh-spotlight-platform">{card.platform}</p>
        ) : null}
      </div>
    </article>
  );
}
