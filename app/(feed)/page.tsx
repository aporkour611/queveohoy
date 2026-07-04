import type { Metadata } from "next";
import { buildHomePageMetadata } from "../lib/home-page-data";
import { HomeFeedPageServer } from "../components/HomeFeedPageServer";

export const revalidate = 900;
export const maxDuration = 10;

export async function generateMetadata(): Promise<Metadata> {
  return buildHomePageMetadata();
}

export default function Page() {
  return <HomeFeedPageServer />;
}
