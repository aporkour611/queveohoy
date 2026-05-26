import { FaqSection } from "./FaqSection";
import { getHubFaqItems } from "../lib/seo-jsonld";

type Props = {
  slug: string;
};

export function HubFaq({ slug }: Props) {
  const items = getHubFaqItems(slug);
  if (!items.length) return null;

  return (
    <FaqSection
      items={items}
      sectionId={`qvh-hub-faq-${slug}`}
      className="qvh-faq qvh-hub-faq"
    />
  );
}
