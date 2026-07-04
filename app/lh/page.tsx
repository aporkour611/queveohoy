import {
  buildHomePageMetadata,
  HomeFeedPageServer,
} from "../components/HomeFeedPageServer";

export const revalidate = 900;
export const maxDuration = 10;

export async function generateMetadata() {
  return buildHomePageMetadata();
}

/** Home SSR-only para PSI/Lighthouse (rewrite desde middleware). */
export default function LighthouseHomePage() {
  return <HomeFeedPageServer audit />;
}
