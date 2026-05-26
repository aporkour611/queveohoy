import { Logo } from "./Logo";

/** Placeholder mientras carga la home en el cliente (evita SSR pesado). */
export function HomePageSkeleton() {
  return (
    <div className="fh-body">
      <nav className="fh-navbar">
        <div className="fh-navbar-inner">
          <Logo />
        </div>
      </nav>
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
