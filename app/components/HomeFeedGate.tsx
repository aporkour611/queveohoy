"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, type ComponentProps } from "react";
import {
  consumeHomeFeedWeekIntent,
  HOME_FEED_ACTIVATE_EVENT,
  prefetchHomeFeedWeek,
} from "@/app/lib/home-feed-intent";

const HomeFeed = dynamic(
  () => import("./HomePage").then((mod) => mod.HomeFeed),
  { ssr: false }
);

type HomeFeedProps = ComponentProps<typeof HomeFeed> & {
  /** Si true, hidrata en cuanto el hilo principal esté libre (feed vacío / error SSR). */
  eager?: boolean;
};

/** PSI desktop: retrasa hidratación. Interacción con calendario: activar al instante. */
const HYDRATION_IDLE_DESKTOP_MS = 1_200;
const HYDRATION_IDLE_TOUCH_MS = 450;
const HYDRATION_EAGER_MS = 150;

function resolveHydrationIdleMs(): number {
  if (typeof window === "undefined") return HYDRATION_IDLE_DESKTOP_MS;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const narrow = window.matchMedia("(max-width: 720px)").matches;
  return coarse || narrow ? HYDRATION_IDLE_TOUCH_MS : HYDRATION_IDLE_DESKTOP_MS;
}

/** Hidrata el feed tras interacción o timeout corto; «Semana completa» en shell SSR activa al instante. */
export function HomeFeedGate({ eager = false, ...props }: HomeFeedProps) {
  const [ready, setReady] = useState(false);
  const [initialWeekView, setInitialWeekView] = useState(false);

  useEffect(() => {
    if (ready) return;

    let cancelled = false;
    const activate = (weekView = false) => {
      if (cancelled || ready) return;
      if (weekView) setInitialWeekView(true);
      setReady(true);
    };

    const delayMs = eager ? HYDRATION_EAGER_MS : resolveHydrationIdleMs();
    const fallback = window.setTimeout(() => activate(false), delayMs);

    const onInteract = () => activate(false);
    const onActivateFeed = () => activate(consumeHomeFeedWeekIntent());

    window.addEventListener("pointerdown", onInteract, { passive: true, once: true });
    window.addEventListener("touchstart", onInteract, { passive: true, once: true });
    window.addEventListener("keydown", onInteract, { passive: true, once: true });
    window.addEventListener(HOME_FEED_ACTIVATE_EVENT, onActivateFeed);

    const idleHandle =
      typeof window.requestIdleCallback === "function"
        ? window.requestIdleCallback(
            () => {
              prefetchHomeFeedWeek();
            },
            { timeout: 2_500 }
          )
        : null;
    const idleFallback =
      idleHandle === null ? window.setTimeout(prefetchHomeFeedWeek, 2_500) : null;

    return () => {
      cancelled = true;
      window.clearTimeout(fallback);
      window.removeEventListener("pointerdown", onInteract);
      window.removeEventListener("touchstart", onInteract);
      window.removeEventListener("keydown", onInteract);
      window.removeEventListener(HOME_FEED_ACTIVATE_EVENT, onActivateFeed);
      if (idleHandle !== null && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleHandle);
      }
      if (idleFallback !== null) {
        window.clearTimeout(idleFallback);
      }
    };
  }, [ready, eager]);

  if (!ready) return null;

  return <HomeFeed {...props} initialWeekView={initialWeekView} />;
}
