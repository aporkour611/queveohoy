import type { Metadata } from "next";
import { HomeJsonLd } from "./components/HomeJsonLd";
import { HomePageClient } from "./components/HomePageClient";
import { homeMetadata } from "./lib/seo";

export const metadata: Metadata = homeMetadata;

export default function Page() {
  return (
    <>
      <HomeJsonLd />
      <HomePageClient />
    </>
  );
}
