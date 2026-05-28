import { HomeLogoLink } from "./HomeLogoLink";
import { HomeNavActions } from "./HomeNavActions";

export function HomeNav() {
  return (
    <>
      <div className="fh-header-ambient" aria-hidden>
        <span className="fh-header-ambient-wash" />
        <span className="fh-header-ambient-veil" />
      </div>
      <header className="fh-header-shell">
        <nav className="fh-navbar fh-navbar-elevated">
          <div className="fh-navbar-inner">
            <HomeLogoLink />
            <HomeNavActions />
          </div>
        </nav>
      </header>
    </>
  );
}
