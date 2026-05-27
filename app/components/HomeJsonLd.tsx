import type { EventRow } from "./types";
import { buildHomeJsonLd } from "../lib/seo-jsonld";
import { serializeJsonLd } from "../lib/safe-json-ld";

type Props = {
  events: EventRow[];
};

export function HomeJsonLd({ events }: Props) {
  const jsonLd = buildHomeJsonLd(events);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
    />
  );
}
