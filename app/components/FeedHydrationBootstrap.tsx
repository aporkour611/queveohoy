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
    const hasSsrContent = (props.initialEventCount ?? 0) > 0;
    return subscribeFeedHydration({
      desktopIdleMs: hasSsrContent ? 1_200 : 4_000,
      touchIdleMs: hasSsrContent ? 600 : 2_500,
      onActivate: () => {
        void import("./FeedClientRootsInner").then((mod) => {
          setRoots(() => mod.FeedClientRootsInner);
        });
      },
    });
  }, [props.initialEventCount]);

  if (!Roots) return null;

  return <Roots {...props} />;
}
