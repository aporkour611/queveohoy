"use client";

import { useEffect, useState, type ComponentType } from "react";
import { subscribeFeedHydration } from "@/app/lib/interaction-gate";
import type { FeedClientRootsProps } from "./FeedClientRootsInner";

type Props = FeedClientRootsProps;

/**
 * ~2 KB: no importa HomePage ni chunks 3794 hasta activación real.
 * PSI no ejecuta listeners ni import() del bundle pesado.
 */
export function FeedHydrationBootstrap(props: Props) {
  const [Roots, setRoots] = useState<ComponentType<FeedClientRootsProps> | null>(
    null
  );

  useEffect(() => {
    return subscribeFeedHydration({
      desktopIdleMs: 8_000,
      onActivate: () => {
        void import("./FeedClientRootsInner").then((mod) => {
          setRoots(() => mod.FeedClientRootsInner);
        });
      },
    });
  }, []);

  if (!Roots) return null;

  return <Roots {...props} />;
}
