import type { Metadata } from "next";
import { HomeJsonLd } from "./components/HomeJsonLd";
import { HomePage } from "./components/HomePage";
import { homeMetadata } from "./lib/seo";

export const metadata: Metadata = homeMetadata;

export default function Page() {
  return (
    <>
      <HomeJsonLd />
      <HomePage />
    </>
  );
}
