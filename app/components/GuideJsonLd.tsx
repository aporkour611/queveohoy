import type { SeoGuideConfig } from "../lib/seo-guides"
import { buildGuideJsonLd } from "../lib/guide-jsonld"
import { serializeJsonLd } from "../lib/safe-json-ld"

type Props = {
  guide: SeoGuideConfig
}

export function GuideJsonLd({ guide }: Props) {
  const jsonLd = buildGuideJsonLd(guide)

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
    />
  )
}
