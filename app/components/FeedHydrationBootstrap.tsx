"use client";

import { useEffect, useState, type ComponentType } from "react";
import { subscribeFeedHydration } from "@/app/lib/interaction-gate";
import type { FeedClientRootsProps } from "./FeedClientRootsInner";

type Props = FeedClientRootsProps & {
  eagerFeed: boolean;
};

/**
 * ~2 KB: no importa HomePage ni chunks 3794 hasta activación real.
 * PSI solo hidrata este módulo (gate noop).
 */
export function FeedHydrationBootstrap({ eagerFeed, ...props }: Props) {
  const [Roots, setRoots] = useState<ComponentType<FeedClientRootsProps> | null>(
    null
  );

  useEffect(() => {
    return subscribeFeedHydration({
      eager: eagerFeed,
      desktopIdleMs: 1_200,
      onActivate: () => {
        void import("./FeedClientRootsInner").then((mod) => {
          setRoots(() => mod.FeedClientRootsInner);
        });
      },
    });
  }, [eagerFeed]);

  if (!Roots) return null;

  return <Roots {...props} />;
}
