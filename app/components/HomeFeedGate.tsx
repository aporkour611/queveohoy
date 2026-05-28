"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, type ComponentProps } from "react";

const HomeFeed = dynamic(
  () => import("./HomePage").then((mod) => mod.HomeFeed),
  { ssr: false }
);

type HomeFeedProps = ComponentProps<typeof HomeFeed>;

export function HomeFeedGate(props: HomeFeedProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const activate = () => {
      if (cancelled || ready) return;
      setReady(true);
    };

    const idle =
      typeof window.requestIdleCallback === "function"
        ? window.requestIdleCallback(activate, { timeout: 1200 })
        : undefined;
    const fallback = window.setTimeout(activate, 400);

    const onInteract = () => activate();
    window.addEventListener("pointerdown", onInteract, { passive: true, once: true });
    window.addEventListener("keydown", onInteract, { passive: true, once: true });

    return () => {
      cancelled = true;
      if (
        idle !== undefined &&
        typeof window.cancelIdleCallback === "function"
      ) {
        window.cancelIdleCallback(idle);
      }
      window.clearTimeout(fallback);
      window.removeEventListener("pointerdown", onInteract);
      window.removeEventListener("keydown", onInteract);
    };
  }, [ready]);

  if (!ready) return null;

  return <HomeFeed {...props} />;
}
