import { HomeLogoLinkServer } from "./HomeLogoLinkServer";
import { HomeNavActions } from "./HomeNavActions";
import { NavbarHeightSync } from "./NavbarHeightSync";

export function HomeNav() {
  return (
    <header className="fh-header-shell">
      <NavbarHeightSync />
      <nav className="fh-navbar fh-navbar-elevated">
        <div className="fh-navbar-inner">
          <HomeLogoLinkServer />
          <HomeNavActions />
        </div>
      </nav>
    </header>
  );
}
