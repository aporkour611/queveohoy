"use client";

import Link from "next/link";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, sans-serif",
          background: "#0a0a0f",
          color: "#fff",
        }}
      >
        <main style={{ maxWidth: 520, margin: "48px auto", padding: "0 16px" }}>
          <h1 style={{ marginTop: 0 }}>Error en queveohoy.es</h1>
          <p>
            La página no pudo cargarse. Prueba de nuevo; si persiste, vuelve en
            unos minutos.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={reset}
              style={{
                padding: "10px 18px",
                border: 0,
                borderRadius: 8,
                background: "#5D5FEF",
                color: "#fff",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Reintentar
            </button>
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "10px 18px",
                borderRadius: 8,
                background: "#1a1a2e",
                color: "#fff",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Ir al inicio
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
