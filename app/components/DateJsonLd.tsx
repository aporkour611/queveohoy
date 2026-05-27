import type { EventRow } from "./types";
import { buildDateJsonLd } from "../lib/seo-jsonld";
import { serializeJsonLd } from "../lib/safe-json-ld";

type Props = {
  dateKey: string;
  events: EventRow[];
};

export function DateJsonLd({ dateKey, events }: Props) {
  const jsonLd = buildDateJsonLd(dateKey, events);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
    />
  );
}
