import { HomeLogoLink } from "./HomeLogoLink";
import { HomeNavActions } from "./HomeNavActions";
import { NavbarHeightSync } from "./NavbarHeightSync";

export function HomeNav() {
  return (
    <header className="fh-header-shell fh-header-volumetric">
      <NavbarHeightSync />
      <div className="fh-header-depth" aria-hidden />
      <nav className="fh-navbar fh-navbar-elevated fh-navbar-volumetric">
        <div className="fh-navbar-inner">
          <HomeLogoLink />
          <HomeNavActions />
        </div>
      </nav>
    </header>
  );
}
