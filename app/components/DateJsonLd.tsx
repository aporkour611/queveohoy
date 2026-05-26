import type { EventRow } from "./types";
import { buildDateJsonLd } from "../lib/seo-jsonld";

type Props = {
  dateKey: string;
  events: EventRow[];
};

export function DateJsonLd({ dateKey, events }: Props) {
  const jsonLd = buildDateJsonLd(dateKey, events);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
