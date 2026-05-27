import type { EventRow } from "./types";
import { buildPartidoJsonLd } from "../lib/seo-jsonld";
import { serializeJsonLd } from "../lib/safe-json-ld";

type Props = {
  event: EventRow;
};

export function PartidoJsonLd({ event }: Props) {
  const jsonLd = buildPartidoJsonLd(event);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
    />
  );
}
