import type { EventRow } from "./types";
import type { SeoHubConfig } from "../lib/seo-hubs";
import { buildHubJsonLd } from "../lib/seo-jsonld";

type Props = {
  hub: SeoHubConfig;
  events: EventRow[];
};

export function HubJsonLd({ hub, events }: Props) {
  const jsonLd = buildHubJsonLd(hub, events);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
