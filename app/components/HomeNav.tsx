import { shouldDeferHeavyServer } from "../lib/defer-heavy-server"
import { HomeLogoLinkServer } from "./HomeLogoLinkServer"
import { HomeNavClient } from "./HomeNavClient"
import { HomeNavStatic } from "./HomeNavStatic"

export async function HomeNav() {
  if (await shouldDeferHeavyServer()) {
    return <HomeNavStatic />
  }

  return (
    <header className="fh-header-shell fh-header-volumetric">
      <HomeNavClient logo={<HomeLogoLinkServer />} />
    </header>
  )
}
