"use client";

import { Analytics as VercelAnalytics } from "@vercel/analytics/react";
import { useEffect, useState } from "react";
import {
  COOKIE_CONSENT_EVENT,
  hasPreferenceConsent,
} from "../lib/cookie-consent";
import { deferClientStateUpdate } from "../lib/defer-client-state";

export function Analytics() {
  const [enabled, setEnabled] = useState(false);

  const [ready, setReady] = useState(false);

  useEffect(() => {
    deferClientStateUpdate(() => setEnabled(hasPreferenceConsent()));

    function sync() {
      setEnabled(hasPreferenceConsent());
    }

    window.addEventListener(COOKIE_CONSENT_EVENT, sync);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, sync);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    const activate = () => {
      if (!cancelled) setReady(true);
    };

    const onInteract = () => activate();
    window.addEventListener("pointerdown", onInteract, { passive: true, once: true });
    window.addEventListener("keydown", onInteract, { passive: true, once: true });
    const fallback = window.setTimeout(activate, 45_000);

    return () => {
      cancelled = true;
      window.clearTimeout(fallback);
      window.removeEventListener("pointerdown", onInteract);
      window.removeEventListener("keydown", onInteract);
      deferClientStateUpdate(() => setReady(false));
    };
  }, [enabled]);

  if (!enabled || !ready) return null;
  return <VercelAnalytics />;
}
