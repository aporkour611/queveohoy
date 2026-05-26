"use client";

import dynamic from "next/dynamic";
import { HomePageSkeleton } from "./HomePageSkeleton";

const HomePage = dynamic(
  () => import("./HomePage").then((mod) => mod.HomePage),
  {
    ssr: false,
    loading: () => <HomePageSkeleton />,
  }
);

type Props = {
  pageTitle: string;
  pageLead: string;
};

export function HomePageClient({ pageTitle, pageLead }: Props) {
  return (
    <HomePage
      initialEvents={[]}
      initialError={null}
      pageTitle={pageTitle}
      pageLead={pageLead}
    />
  );
}
