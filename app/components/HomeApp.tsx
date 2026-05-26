"use client";

import { useEffect, useState } from "react";
import { HomePage } from "./HomePage";

function HomeShell() {
  return (
    <div className="fh-body">
      <main className="fh-content">
        <div className="fh-container fh-main">
          <div className="fh-empty fh-loading" style={{ minHeight: "40vh" }}>
            <div className="qvh-spinner" aria-hidden />
            <p>Cargando agenda…</p>
          </div>
        </div>
      </main>
    </div>
  );
}

/** Monta la agenda interactiva solo en el navegador (SSR minimo). */
export function HomeApp() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready) {
    return <HomeShell />;
  }

  return <HomePage />;
}
