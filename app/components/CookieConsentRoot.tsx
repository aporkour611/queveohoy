"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, type ReactNode } from "react";

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

export function CookieConsentRoot({ children }: { children: ReactNode }) {
  const [promptsReady, setPromptsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const activate = () => {
      if (!cancelled) setPromptsReady(true);
    };

    const idle =
      typeof window.requestIdleCallback === "function"
        ? window.requestIdleCallback(activate, { timeout: 4500 })
        : undefined;
    const fallback = window.setTimeout(activate, 3500);

    return () => {
      cancelled = true;
      if (
        idle !== undefined &&
        typeof window.cancelIdleCallback === "function"
      ) {
        window.cancelIdleCallback(idle);
      }
      window.clearTimeout(fallback);
    };
  }, []);

  return (
    <>
      {children}
      {promptsReady ? (
        <>
          <CookieConsentBanner />
          <PushNotificationPrompt />
          <InstallAppPrompt />
        </>
      ) : null}
    </>
  );
}
