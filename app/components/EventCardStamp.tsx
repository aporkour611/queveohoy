import type { EventCardStampKind } from "../lib/event-card-stamp";

type Props = {
  kind: EventCardStampKind;
  size?: "default" | "compact";
};

export function EventCardStamp({ kind, size = "default" }: Props) {
  const label = kind === "final" ? "Final" : "Estreno";

  return (
    <div
      className={`qvh-event-stamp qvh-event-stamp-${kind} qvh-event-stamp-${size}`}
      aria-label={label}
      role="img"
    >
      <span className="qvh-event-stamp-label">{label}</span>
    </div>
  );
}
