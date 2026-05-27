import Link from "next/link";

export default function NotFound() {
  return (
    <main className="fh-content" style={{ padding: "48px 16px" }}>
      <div className="fh-container" style={{ maxWidth: 560 }}>
        <h1 style={{ marginTop: 0 }}>Página no encontrada</h1>
        <p>
          No existe esta URL en queveohoy.es. Vuelve al inicio para ver la
          agenda de hoy: partidos, deportes y estrenos con horarios en España.
        </p>
        <Link href="/" className="fh-btn fh-btn-primary">
          Ir al inicio
        </Link>
      </div>
    </main>
  );
}
