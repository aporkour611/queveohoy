"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";

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
  return (
    <>
      {children}
      <CookieConsentBanner />
      <PushNotificationPrompt />
      <InstallAppPrompt />
    </>
  );
}
