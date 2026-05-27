"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#0a0a0f", color: "#fff" }}>
        <main style={{ maxWidth: 520, margin: "48px auto", padding: "0 16px" }}>
          <h1 style={{ marginTop: 0 }}>Error en queveohoy.es</h1>
          <p>
            La página no pudo cargarse. Prueba de nuevo; si persiste, vuelve en
            unos minutos.
          </p>
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
        </main>
      </body>
    </html>
  );
}
