import { FaqSection } from "./FaqSection";
import { HOME_FAQ_ITEMS } from "../lib/seo-jsonld";

export function HomeFaq() {
  return (
    <FaqSection
      items={HOME_FAQ_ITEMS}
      sectionId="qvh-faq-title"
      className="qvh-faq qvh-home-faq"
    />
  );
}