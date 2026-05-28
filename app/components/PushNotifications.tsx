"use client";

import "../push.css";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  COOKIE_CONSENT_EVENT,
  hasPreferenceConsent,
} from "../lib/cookie-consent";
import {
  dismissPushPrompt,
  isPushSubscribedLocally,
  isPushSupported,
  readLocalPushTopics,
  subscribeToPush,
  unsubscribeFromPush,
  updatePushTopics,
  writeLocalPushTopics,
} from "../lib/push-client";
import {
  notifyPushPreferencesSaved,
  PUSH_CONSENT_EVENT,
  readPushConsent,
} from "../lib/push-consent";
import {
  DEFAULT_PUSH_TOPICS,
  PUSH_TOPICS,
  type PushTopicId,
} from "../lib/push-preferences";

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3a4.5 4.5 0 0 0-4.5 4.5v2.1c0 .5-.2 1-.5 1.4L5.8 14.2A1.8 1.8 0 0 0 7.4 17h9.2a1.8 1.8 0 0 0 1.6-2.8l-1.2-2.2c-.3-.4-.5-.9-.5-1.4V7.5A4.5 4.5 0 0 0 12 3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M10 18.5a2 2 0 0 0 4 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

type PushSettingsPanelProps = {
  open: boolean;
  onClose: () => void;
  onPreferencesSaved?: () => void;
};

export function PushSettingsPanel({
  open,
  onClose,
  onPreferencesSaved,
}: PushSettingsPanelProps) {
  const [topics, setTopics] = useState<PushTopicId[]>(() =>
    readLocalPushTopics()
  );
  const [subscribed, setSubscribed] = useState(false);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setTopics(readLocalPushTopics());
      setStatus("");
    });

    void isPushSubscribedLocally().then((value) => {
      if (!cancelled) setSubscribed(value);
    });

    return () => {
      cancelled = true;
    };
  }, [open]);

  const toggleTopic = useCallback((topicId: PushTopicId) => {
    setTopics((current) => {
      const next = current.includes(topicId)
        ? current.filter((id) => id !== topicId)
        : [...current, topicId];
      return next.length > 0 ? next : [...DEFAULT_PUSH_TOPICS];
    });
  }, []);

  const handleEnable = useCallback(async () => {
    setBusy(true);
    setStatus("");
    writeLocalPushTopics(topics);
    const result = await subscribeToPush(topics);
    setBusy(false);
    if (result.ok) {
      setSubscribed(true);
      setStatus("Avisos activados. Te avisamos ~45 min antes de cada destacado.");
      notifyPushPreferencesSaved();
      onPreferencesSaved?.();
      onClose();
      return;
    }
    setStatus(result.error ?? "No se pudieron activar los avisos.");
  }, [topics, onClose, onPreferencesSaved]);

  const handleSave = useCallback(async () => {
    setBusy(true);
    setStatus("");
    const result = await updatePushTopics(topics);
    setBusy(false);
    if (result.ok) {
      setStatus("Preferencias guardadas.");
      notifyPushPreferencesSaved();
      onPreferencesSaved?.();
      onClose();
      return;
    }
    setStatus(result.error ?? "No se pudieron guardar las preferencias.");
  }, [topics, onClose, onPreferencesSaved]);

  const handleDisable = useCallback(async () => {
    setBusy(true);
    await unsubscribeFromPush();
    setSubscribed(false);
    setBusy(false);
    setStatus("Avisos desactivados.");
  }, []);

  if (!open) return null;

  return (
    <>
      <div
        className="qvh-push-panel-backdrop"
        onClick={onClose}
        aria-hidden
      />
      <div
        className="qvh-push-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Avisos de eventos"
      >
        <h2>Avisos en el móvil</h2>
        <p>
          Te avisamos unos 45 minutos antes de los eventos de{" "}
          <strong>Qué veo hoy</strong>. Máximo 2 avisos al día.
        </p>

        <ul className="qvh-push-topic-list">
          {PUSH_TOPICS.map((topic) => (
            <li key={topic.id}>
              <label>
                <input
                  type="checkbox"
                  checked={topics.includes(topic.id)}
                  onChange={() => toggleTopic(topic.id)}
                  disabled={busy}
                />
                <span>{topic.label}</span>
              </label>
            </li>
          ))}
        </ul>

        {status ? <p className="qvh-push-status">{status}</p> : null}

        <div className="qvh-push-panel-actions">
          {!subscribed ? (
            <button
              type="button"
              className="qvh-push-btn qvh-push-btn-primary"
              onClick={() => void handleEnable()}
              disabled={busy}
            >
              Activar avisos
            </button>
          ) : (
            <>
              <button
                type="button"
                className="qvh-push-btn qvh-push-btn-primary"
                onClick={() => void handleSave()}
                disabled={busy}
              >
                Guardar
              </button>
              <button
                type="button"
                className="qvh-push-btn qvh-push-btn-secondary"
                onClick={() => void handleDisable()}
                disabled={busy}
              >
                Desactivar
              </button>
            </>
          )}
          <button
            type="button"
            className="qvh-push-btn qvh-push-btn-ghost"
            onClick={onClose}
            disabled={busy}
          >
            Cerrar
          </button>
        </div>
      </div>
    </>
  );
}

export function PushNavButton() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!isPushSupported()) return;

    function sync() {
      void isPushSubscribedLocally().then(setActive);
    }

    sync();
    window.addEventListener(PUSH_CONSENT_EVENT, sync);
    return () => window.removeEventListener(PUSH_CONSENT_EVENT, sync);
  }, []);

  if (!isPushSupported()) return null;

  return (
    <>
      <button
        type="button"
        className="qvh-push-nav-btn"
        aria-label="Avisos de eventos"
        aria-pressed={active}
        title="Avisos de eventos"
        onClick={() => setOpen(true)}
      >
        <BellIcon />
      </button>
      <PushSettingsPanel open={open} onClose={() => setOpen(false)} />
    </>
  );
}

export function PushNotificationPrompt() {
  const [visible, setVisible] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [supported] = useState(() => isPushSupported());

  useEffect(() => {
    if (!supported) return;

    function evaluate() {
      if (!hasPreferenceConsent()) {
        setVisible(false);
        return;
      }

      const consent = readPushConsent();
      if (consent) {
        setVisible(false);
        return;
      }

      setVisible(true);
    }

    evaluate();
    window.addEventListener(COOKIE_CONSENT_EVENT, evaluate);
    window.addEventListener(PUSH_CONSENT_EVENT, evaluate);
    return () => {
      window.removeEventListener(COOKIE_CONSENT_EVENT, evaluate);
      window.removeEventListener(PUSH_CONSENT_EVENT, evaluate);
    };
  }, [supported]);

  const handleLater = useCallback(() => {
    dismissPushPrompt();
    setVisible(false);
  }, []);

  if (!supported) return null;

  return (
    <>
      {visible ? (
        <div
          className="qvh-push-banner"
          role="dialog"
          aria-live="polite"
          aria-label="Activar avisos"
        >
          <p className="qvh-push-banner-title">¿Te avisamos antes de lo importante?</p>
          <p className="qvh-push-banner-text">
            Recibe en el móvil un aviso ~45 min antes de partidos, UFC, series o
            motor de <strong>Qué veo hoy</strong>. Máximo 2 al día.{" "}
            <Link href="/privacidad">Privacidad</Link>.
          </p>
          <div className="qvh-push-banner-actions">
            <button
              type="button"
              className="qvh-push-btn qvh-push-btn-primary"
              onClick={() => {
                setVisible(false);
                setPanelOpen(true);
              }}
            >
              Configurar avisos
            </button>
            <button
              type="button"
              className="qvh-push-btn qvh-push-btn-ghost"
              onClick={handleLater}
            >
              Ahora no
            </button>
          </div>
        </div>
      ) : null}
      <PushSettingsPanel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        onPreferencesSaved={() => setVisible(false)}
      />
    </>
  );
}
