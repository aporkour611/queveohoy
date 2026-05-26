import type { Metadata } from "next";
import { pageMetadata } from "./seo";

export type SeoGuideConfig = {
  slug: string;
  title: string;
  h1: string;
  description: string;
  keywords: string[];
  priority: number;
};

export const SEO_GUIDES: SeoGuideConfig[] = [
  {
    slug: "champions-espana",
    title: "Dónde ver la Champions League en España",
    h1: "Dónde ver la Champions League en TV y streaming",
    description:
      "Guía actualizada: canales y plataformas para ver la Champions League en España (La 1, Movistar, DAZN) y agenda de partidos.",
    keywords: [
      "donde ver champions",
      "champions movistar",
      "champions dazn",
      "champions la 1",
      "champions league españa tv",
    ],
    priority: 0.85,
  },
  {
    slug: "laliga-espana",
    title: "Dónde ver LaLiga en España",
    h1: "Dónde ver LaLiga en TV y streaming",
    description:
      "Guía para ver LaLiga en España: Movistar LaLiga, DAZN LaLiga, partidos en abierto y agenda diaria con horarios.",
    keywords: [
      "donde ver laliga",
      "laliga movistar",
      "dazn laliga",
      "laliga tv españa",
      "primera division canal",
    ],
    priority: 0.85,
  },
];

export const SEO_GUIDE_SLUGS = SEO_GUIDES.map((g) => g.slug);

export function getSeoGuide(slug: string): SeoGuideConfig | undefined {
  return SEO_GUIDES.find((g) => g.slug === slug);
}

export function guideMetadata(guide: SeoGuideConfig): Metadata {
  return pageMetadata(
    `/guia/${guide.slug}`,
    guide.title,
    guide.description,
    guide.keywords
  );
}
