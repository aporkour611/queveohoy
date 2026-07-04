import { HomeLogoLinkServer } from "./HomeLogoLinkServer"

/** Nav 100 % SSR — sin client boundaries (PSI / Lighthouse). */
export function HomeNavStatic() {
  return (
    <header className="fh-header-shell fh-header-volumetric">
      <div className="fh-header-depth" aria-hidden />
      <nav
        className="fh-navbar fh-navbar-elevated fh-navbar-volumetric"
        aria-label="Navegación principal"
      >
        <div className="fh-navbar-inner">
          <HomeLogoLinkServer />
          <div className="fh-nav-links">
            <a href="/explorar" className="fh-nav-explorar-link">
              Explorar
            </a>
            <span className="fh-nav-action-placeholder" aria-hidden />
            <span className="fh-nav-action-placeholder" aria-hidden />
            <span className="fh-nav-action-placeholder" aria-hidden />
            <span className="fh-nav-action-placeholder" aria-hidden />
          </div>
        </div>
      </nav>
    </header>
  )
}
