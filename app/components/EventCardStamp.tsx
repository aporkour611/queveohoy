import type { EventCardStampKind } from "../lib/event-card-stamp";

type Props = {
  kind: EventCardStampKind;
  size?: "default" | "compact";
};

const REPEAT = 12;

function stampText(kind: EventCardStampKind): string {
  const word = kind === "final" ? "FINAL" : "ESTRENO";
  return Array.from({ length: REPEAT }, () => word).join(" ");
}

export function EventCardStamp({ kind, size = "default" }: Props) {
  const label = kind === "final" ? "Final" : "Estreno";

  return (
    <div
      className={`qvh-event-stamp qvh-event-stamp-${kind} qvh-event-stamp-${size}`}
      aria-label={label}
      role="img"
    >
      <div className="qvh-event-stamp-band">
        <span className="qvh-event-stamp-track">{stampText(kind)}</span>
      </div>
    </div>
  );
}
