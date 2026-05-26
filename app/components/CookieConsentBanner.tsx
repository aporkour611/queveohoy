"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  clearPreferenceStorage,
  COOKIE_CONSENT_EVENT,
  notifyCookieConsentChange,
  readCookieConsent,
  writeCookieConsent,
  type CookieConsentChoice,
} from "../lib/cookie-consent";

export function CookieConsentBanner() {
  const [choice, setChoice] = useState<CookieConsentChoice | null>(() =>
    typeof window === "undefined" ? null : readCookieConsent()
  );
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setChoice(readCookieConsent());
    setReady(true);

    function sync() {
      setChoice(readCookieConsent());
    }

    window.addEventListener(COOKIE_CONSENT_EVENT, sync);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, sync);
  }, []);

  const respond = useCallback((next: CookieConsentChoice) => {
    writeCookieConsent(next);
    if (next === "rejected") {
      clearPreferenceStorage();
    }
    setChoice(next);
    notifyCookieConsentChange();
  }, []);

  if (!ready || choice) return null;

  return (
    <div
      className="qvh-cookie-banner"
      role="dialog"
      aria-live="polite"
      aria-label="Consentimiento de cookies"
    >
      <div className="qvh-cookie-banner-inner">
        <div className="qvh-cookie-banner-copy">
          <p className="qvh-cookie-banner-title">Usamos cookies</p>
          <p className="qvh-cookie-banner-text">
            Utilizamos cookies y almacenamiento local para recordar tus filtros,
            zona horaria y medición técnica del sitio. Puedes aceptarlas o
            rechazarlas. Más info en la{" "}
            <Link href="/cookies">política de cookies</Link>.
          </p>
        </div>
        <div className="qvh-cookie-banner-actions">
          <button
            type="button"
            className="qvh-cookie-btn qvh-cookie-btn-reject"
            onClick={() => respond("rejected")}
          >
            Rechazar
          </button>
          <button
            type="button"
            className="qvh-cookie-btn qvh-cookie-btn-accept"
            onClick={() => respond("accepted")}
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
