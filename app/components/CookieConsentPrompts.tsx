"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { shouldDeferHeavyClient } from "@/app/lib/interaction-gate";

const CookieConsentBanner = dynamic(
  () =>
    import("./CookieConsentBanner").then((mod) => mod.CookieConsentBanner),
  { ssr: false }
);

const PushNotificationPrompt = dynamic(
  () =>
    import("./PushNotifications").then((mod) => mod.PushNotificationPrompt),
  { ssr: false }
);

const InstallAppPrompt = dynamic(
  () =>
    import("./InstallAppPrompt").then((mod) => mod.InstallAppPrompt),
  { ssr: false }
);

/** Prompts diferidos — sin envolver el árbol SSR (menor hidratación / FID). */
export function CookieConsentPrompts() {
  const deferHeavy = shouldDeferHeavyClient();
  const [promptsReady, setPromptsReady] = useState(false);

  useEffect(() => {
    if (deferHeavy) return;
    const schedule = () => setPromptsReady(true);
    if (typeof window.requestIdleCallback === "function") {
      const idleId = window.requestIdleCallback(schedule, { timeout: 45_000 });
      return () => window.cancelIdleCallback(idleId);
    }
    const fallback = window.setTimeout(schedule, 45_000);
    return () => window.clearTimeout(fallback);
  }, [deferHeavy]);

  if (deferHeavy || !promptsReady) return null;

  return (
    <>
      <CookieConsentBanner />
      <PushNotificationPrompt />
      <InstallAppPrompt />
    </>
  );
}
