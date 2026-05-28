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
    if (!enabled) {
      setReady(false);
      return;
    }

    const schedule = () => deferClientStateUpdate(() => setReady(true));
    if (typeof requestIdleCallback === "function") {
      const id = requestIdleCallback(schedule, { timeout: 3500 });
      return () => cancelIdleCallback(id);
    }

    const timer = setTimeout(schedule, 1800);
    return () => clearTimeout(timer);
  }, [enabled]);

  if (!enabled || !ready) return null;
  return <VercelAnalytics />;
}
