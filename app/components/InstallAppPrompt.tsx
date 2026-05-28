"use client";

import "../install-app.css";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import {
  canOfferInstallPrompt,
  captureInstallPrompt,
  dismissInstallPrompt,
  getInstallHeadline,
  getInstallPlatform,
  getInstallPrimaryLabel,
  hasDeferredInstallPrompt,
  INSTALL_BENEFITS,
  INSTALL_PROMPT_DELAY_MS,
  triggerInstallPrompt,
} from "../lib/pwa-install";
import { PUSH_PREFERENCES_SAVED_EVENT } from "../lib/push-consent";

export function InstallAppPrompt() {
  const [visible, setVisible] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [canNativeInstall, setCanNativeInstall] = useState(false);
  const [platform] = useState(() => getInstallPlatform());

  useEffect(() => {
    if (!canOfferInstallPrompt()) return;

    const syncInstallReady = () => {
      setCanNativeInstall(hasDeferredInstallPrompt());
    };

    const cleanupCapture = captureInstallPrompt(syncInstallReady);
    syncInstallReady();

    let delayTimer: number | undefined;

    const schedulePrompt = () => {
      if (!canOfferInstallPrompt()) return;

      window.clearTimeout(delayTimer);
      delayTimer = window.setTimeout(() => {
        if (canOfferInstallPrompt()) {
          setVisible(true);
        }
      }, INSTALL_PROMPT_DELAY_MS);
    };

    window.addEventListener(PUSH_PREFERENCES_SAVED_EVENT, schedulePrompt);

    return () => {
      cleanupCapture();
      window.removeEventListener(PUSH_PREFERENCES_SAVED_EVENT, schedulePrompt);
      window.clearTimeout(delayTimer);
    };
  }, []);

  const handleLater = useCallback(() => {
    dismissInstallPrompt();
    setVisible(false);
    setShowHint(false);
  }, []);

  const handleInstall = useCallback(async () => {
    if (showHint) {
      setVisible(false);
      return;
    }

    if (platform === "ios") {
      setShowHint(true);
      return;
    }

    if (canNativeInstall) {
      const outcome = await triggerInstallPrompt();
      if (outcome === "accepted") {
        setVisible(false);
        return;
      }
      if (outcome === "dismissed") return;
    }

    setShowHint(true);
  }, [canNativeInstall, platform, showHint]);

  if (!visible) return null;

  const headline = getInstallHeadline(platform);
  const primaryLabel = getInstallPrimaryLabel(platform);

  return (
    <div
      className="qvh-install-banner"
      role="dialog"
      aria-live="polite"
      aria-label="Instalar Qué veo hoy"
    >
      <div className="qvh-install-banner-inner">
        <div className="qvh-install-banner-head">
          <div className="qvh-install-banner-icon">
            <Image
              src="/icons/app-icon-192.png"
              alt=""
              width={52}
              height={52}
              priority
            />
          </div>
          <div className="qvh-install-banner-copy">
            <p className="qvh-install-banner-eyebrow">Acceso directo</p>
            <h2 className="qvh-install-banner-title">{headline}</h2>
            <p className="qvh-install-banner-lead">
              Un icono en tu pantalla de inicio o escritorio. Sin tiendas, sin
              descargas pesadas.
            </p>
          </div>
        </div>

        <ul className="qvh-install-benefits">
          {INSTALL_BENEFITS.map((benefit) => (
            <li key={benefit}>{benefit}</li>
          ))}
        </ul>

        {showHint ? (
          <p className="qvh-install-hint">
            {platform === "ios" ? (
              <>
                Pulsa <strong>Compartir</strong> en Safari y elige{" "}
                <strong>Añadir a pantalla de inicio</strong>.
              </>
            ) : platform === "android" && !canNativeInstall ? (
              <>
                Abre el menú del navegador (⋮) y elige{" "}
                <strong>Instalar aplicación</strong> o{" "}
                <strong>Añadir a pantalla de inicio</strong>.
              </>
            ) : (
              <>
                En Chrome o Edge, pulsa el icono{" "}
                <strong>Instalar</strong> (⊕) en la barra de direcciones, o
                menú → <strong>Instalar Qué veo hoy</strong>.
              </>
            )}
          </p>
        ) : null}

        <div className="qvh-install-banner-actions">
          <button
            type="button"
            className="qvh-install-btn qvh-install-btn-primary"
            onClick={() => void handleInstall()}
          >
            {showHint ? "Entendido" : primaryLabel}
          </button>
          <button
            type="button"
            className="qvh-install-btn qvh-install-btn-ghost"
            onClick={handleLater}
          >
            Ahora no
          </button>
        </div>
      </div>
    </div>
  );
}
