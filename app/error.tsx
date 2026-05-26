"use client";

import Link from "next/link";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="fh-content" style={{ padding: "48px 16px" }}>
      <div className="fh-container" style={{ maxWidth: 560 }}>
        <h1 style={{ marginTop: 0 }}>No hemos podido cargar la agenda</h1>
        <p>
          Ha ocurrido un error al mostrar los eventos. Puede deberse a una
          imagen o dato temporal; prueba de nuevo en unos segundos.
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button type="button" className="fh-btn fh-btn-primary" onClick={reset}>
            Reintentar
          </button>
          <Link href="/" className="fh-btn">
            Ir al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
