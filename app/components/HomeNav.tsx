import { HomeLogoLinkServer } from "./HomeLogoLinkServer"
import { HomeNavClient } from "./HomeNavClient"

export function HomeNav() {
  return (
    <header className="fh-header-shell fh-header-volumetric">
      <HomeNavClient logo={<HomeLogoLinkServer />} />
    </header>
  )
}
