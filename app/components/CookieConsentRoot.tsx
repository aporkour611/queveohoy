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
    const fallback = window.setTimeout(() => setPromptsReady(true), 45_000);
    return () => window.clearTimeout(fallback);
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
