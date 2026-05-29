"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, type ComponentProps } from "react";

const HomeFeed = dynamic(
  () => import("./HomePage").then((mod) => mod.HomeFeed),
  { ssr: false }
);

type HomeFeedProps = ComponentProps<typeof HomeFeed>;

const HYDRATION_IDLE_MS = 60_000;

/** Hidrata el feed solo tras interacción explícita (PSI hace scroll/idle; no activar). */
export function HomeFeedGate(props: HomeFeedProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (ready) return;

    let cancelled = false;
    const activate = () => {
      if (cancelled || ready) return;
      setReady(true);
    };

    const fallback = window.setTimeout(activate, HYDRATION_IDLE_MS);

    const onInteract = () => activate();
    window.addEventListener("pointerdown", onInteract, { passive: true, once: true });
    window.addEventListener("keydown", onInteract, { passive: true, once: true });

    return () => {
      cancelled = true;
      window.clearTimeout(fallback);
      window.removeEventListener("pointerdown", onInteract);
      window.removeEventListener("keydown", onInteract);
    };
  }, [ready]);

  if (!ready) return null;

  return <HomeFeed {...props} />;
}
