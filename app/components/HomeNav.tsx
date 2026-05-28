import { HomeLogoLink } from "./HomeLogoLink";
import { HomeNavActions } from "./HomeNavActions";

export function HomeNav() {
  return (
    <nav className="fh-navbar">
      <div className="fh-navbar-inner">
        <HomeLogoLink />
        <HomeNavActions />
      </div>
    </nav>
  );
}
