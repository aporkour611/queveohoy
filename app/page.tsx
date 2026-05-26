import type { Metadata } from "next";
import { HomeApp } from "./components/HomeApp";
import { HomeJsonLd } from "./components/HomeJsonLd";
import { homeMetadata } from "./lib/seo";

export const metadata: Metadata = homeMetadata;

export default function Page() {
  return (
    <>
      <HomeJsonLd />
      <HomeApp />
    </>
  );
}
