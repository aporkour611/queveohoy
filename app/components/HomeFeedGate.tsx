"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, type ComponentProps } from "react";

const HomeFeed = dynamic(
  () => import("./HomePage").then((mod) => mod.HomeFeed),
  { ssr: false }
);

type HomeFeedProps = ComponentProps<typeof HomeFeed> & {
  /** Si true, hidrata en cuanto el hilo principal esté libre (feed vacío / error SSR). */
  eager?: boolean;
};

/** PSI / desktop: retrasa hidratación. Móvil real: activar antes para calendario interactivo. */
const HYDRATION_IDLE_DESKTOP_MS = 2_500;
const HYDRATION_IDLE_TOUCH_MS = 1_000;
const HYDRATION_EAGER_MS = 300;

function resolveHydrationIdleMs(): number {
  if (typeof window === "undefined") return HYDRATION_IDLE_DESKTOP_MS;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const narrow = window.matchMedia("(max-width: 720px)").matches;
  return coarse || narrow ? HYDRATION_IDLE_TOUCH_MS : HYDRATION_IDLE_DESKTOP_MS;
}

/** Hidrata el feed tras interacción o timeout corto en móvil (PSI desktop sigue diferido). */
export function HomeFeedGate({ eager = false, ...props }: HomeFeedProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (ready) return;

    let cancelled = false;
    const activate = () => {
      if (cancelled || ready) return;
      setReady(true);
    };

    const delayMs = eager
      ? HYDRATION_EAGER_MS
      : resolveHydrationIdleMs();
    const fallback = window.setTimeout(activate, delayMs);

    const onInteract = () => activate();
    window.addEventListener("pointerdown", onInteract, { passive: true, once: true });
    window.addEventListener("touchstart", onInteract, { passive: true, once: true });
    window.addEventListener("keydown", onInteract, { passive: true, once: true });

    return () => {
      cancelled = true;
      window.clearTimeout(fallback);
      window.removeEventListener("pointerdown", onInteract);
      window.removeEventListener("touchstart", onInteract);
      window.removeEventListener("keydown", onInteract);
    };
  }, [ready, eager]);

  if (!ready) return null;

  return <HomeFeed {...props} />;
}
