"use client";

import { SpeedInsights as VercelSpeedInsights } from "@vercel/speed-insights/next";
import { useEffect, useState } from "react";
import {
  COOKIE_CONSENT_EVENT,
  hasPreferenceConsent,
} from "../lib/cookie-consent";
import { deferClientStateUpdate } from "../lib/defer-client-state";

export function SpeedInsights() {
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
    const fallback = window.setTimeout(() => {
      if (!cancelled) setReady(true);
    }, 45_000);

    return () => {
      cancelled = true;
      window.clearTimeout(fallback);
      deferClientStateUpdate(() => setReady(false));
    };
  }, [enabled]);

  if (!enabled || !ready) return null;
  return <VercelSpeedInsights />;
}
