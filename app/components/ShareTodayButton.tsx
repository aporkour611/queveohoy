"use client";

import { useCallback, useState } from "react";

type Props = {
  title: string;
  text: string;
  url: string;
};

export function ShareTodayButton({ title, text, url }: Props) {
  const [copied, setCopied] = useState(false);

  const share = useCallback(async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch {
        /* usuario canceló o no disponible */
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copia este enlace:", url);
    }
  }, [title, text, url]);

  return (
    <button
      type="button"
      className="qvh-share-today"
      onClick={share}
      aria-label="Compartir agenda de hoy"
    >
      {copied ? "Enlace copiado" : "Compartir agenda de hoy"}
    </button>
  );
}
