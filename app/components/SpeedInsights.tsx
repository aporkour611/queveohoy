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

  useEffect(() => {
    deferClientStateUpdate(() => setEnabled(hasPreferenceConsent()));

    function sync() {
      setEnabled(hasPreferenceConsent());
    }

    window.addEventListener(COOKIE_CONSENT_EVENT, sync);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, sync);
  }, []);

  if (!enabled) return null;
  return <VercelSpeedInsights />;
}
