import type { EventRow } from "../components/types";
import { buildHomeJsonLd } from "../lib/seo-jsonld";

type Props = {
  events: EventRow[];
};

export function HomeJsonLd({ events }: Props) {
  const jsonLd = buildHomeJsonLd(events);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
