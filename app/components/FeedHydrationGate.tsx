"use client";

import dynamic from "next/dynamic";
import { shouldDeferHeavyClient } from "@/app/lib/interaction-gate";
import type { ComponentProps } from "react";
import type { FeedHydrationBootstrap } from "./FeedHydrationBootstrap";

const Bootstrap = dynamic(
  () =>
    import("./FeedHydrationBootstrap").then((mod) => mod.FeedHydrationBootstrap),
  { ssr: false }
);

type Props = ComponentProps<typeof FeedHydrationBootstrap>;

/** PSI/Lighthouse: sin hidratar feed; usuarios reales cargan tras idle. */
export function FeedHydrationGate(props: Props) {
  if (shouldDeferHeavyClient()) return null;
  return <Bootstrap {...props} />;
}
