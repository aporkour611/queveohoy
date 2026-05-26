import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SeoGuidePage } from "../../components/SeoGuidePage";
import {
  getSeoGuide,
  guideMetadata,
  SEO_GUIDES,
} from "../../lib/seo-guides";

export const revalidate = 86400;

export function generateStaticParams() {
  return SEO_GUIDES.map((guide) => ({ slug: guide.slug }));
}

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getSeoGuide(slug);
  if (!guide) return {};
  return guideMetadata(guide);
}

export default async function GuiaRoute({ params }: PageProps) {
  const { slug } = await params;
  const guide = getSeoGuide(slug);
  if (!guide) notFound();

  return <SeoGuidePage guide={guide} />;
}
