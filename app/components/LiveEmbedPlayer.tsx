"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { LivePlayerEmbed } from "../lib/live-player";

type Props = {
  player: LivePlayerEmbed;
  channel: string;
};

const IFRAME_LOAD_TIMEOUT_MS = 12_000;

export function LiveEmbedPlayer({ player, channel }: Props) {
  const [iframeFailed, setIframeFailed] = useState(false);
  const [iframeReady, setIframeReady] = useState(false);
  const iframeReadyRef = useRef(false);

  const handleIframeLoad = useCallback(() => {
    iframeReadyRef.current = true;
    setIframeReady(true);
    setIframeFailed(false);
  }, []);

  useEffect(() => {
    if (!player.embedSrc || player.embedBlocked) return;

    iframeReadyRef.current = false;
    setIframeFailed(false);
    setIframeReady(false);

    const timer = window.setTimeout(() => {
      if (!iframeReadyRef.current) setIframeFailed(true);
    }, IFRAME_LOAD_TIMEOUT_MS);

    return () => window.clearTimeout(timer);
  }, [player.embedSrc, player.embedBlocked]);

  if (player.embedBlocked) {
    return (
      <div className="fh-live-fallback fh-live-fallback-blocked">
        <p>{player.embedBlockedReason}</p>
        <p className="fh-live-fallback-hint">
          Puedes ver <strong>{channel}</strong> gratis en la web oficial del
          emisor.
        </p>
        <a
          href={player.externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="fh-btn fh-btn-primary fh-live-fallback-btn"
        >
          Abrir {channel} en directo
        </a>
      </div>
    );
  }

  if (!player.embedSrc || iframeFailed) {
    return (
      <div className="fh-live-fallback">
        <p>
          No hemos podido cargar el reproductor aquí. Abre{" "}
          <strong>{channel}</strong> en la plataforma oficial.
        </p>
        <a
          href={player.externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="fh-btn fh-btn-primary fh-live-fallback-btn"
        >
          Abrir {channel}
        </a>
      </div>
    );
  }

  const isPageEmbed = player.kind === "atresplayer";

  return (
    <div
      className={`fh-live-player-wrap${
        isPageEmbed ? " fh-live-player-wrap-page" : ""
      }`}
    >
      {!iframeReady ? (
        <p className="fh-live-player-loading" aria-live="polite">
          Cargando retransmisión…
        </p>
      ) : null}
      <iframe
        src={player.embedSrc}
        title={player.playerTitle}
        className="fh-live-player"
        allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        onLoad={handleIframeLoad}
      />
    </div>
  );
}
