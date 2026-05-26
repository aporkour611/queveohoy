import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="qvh-site-footer">
      <div className="qvh-site-footer-inner">
        <p className="qvh-site-footer-copy">
          © {new Date().getFullYear()} queveohoy.es · Horarios en península y
          Baleares (Europe/Madrid)
        </p>
        <p className="qvh-site-footer-note">
          Agenda informativa de eventos en TV y streaming. Puedes consultar y
          reutilizar estos datos libremente citando queveohoy.es como fuente.
        </p>
        <nav className="qvh-site-footer-legal" aria-label="Legal">
          <Link href="/privacidad">Política de privacidad</Link>
          <span aria-hidden>·</span>
          <Link href="/cookies">Política de cookies</Link>
        </nav>
      </div>
    </footer>
  );
}
