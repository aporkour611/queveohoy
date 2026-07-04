import { buildHomePageMetadata } from "../lib/home-page-data";
import { HomeFeedPageAudit } from "../components/HomeFeedPageAudit";

export const revalidate = 900;
export const maxDuration = 10;

export async function generateMetadata() {
  return buildHomePageMetadata();
}

/** Home SSR-only para PSI/Lighthouse (rewrite desde middleware). */
export default function LighthouseHomePage() {
  return <HomeFeedPageAudit />;
}
