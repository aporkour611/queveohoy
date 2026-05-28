import { HomeLogoLink } from "./HomeLogoLink";
import { HomeNavActions } from "./HomeNavActions";

export function HomeNav() {
  return (
    <header className="fh-header-shell">
      <nav className="fh-navbar fh-navbar-elevated">
        <div className="fh-navbar-inner">
          <HomeLogoLink />
          <HomeNavActions />
        </div>
      </nav>
    </header>
  );
}
