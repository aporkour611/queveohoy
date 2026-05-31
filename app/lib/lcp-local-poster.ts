import { existsSync } from "node:fs"
import { join } from "node:path"

const LCP_LOCAL_POSTER_DIR = "/posters/"

/** Si existe el .webp gemelo en public/, úsalo para LCP (menos bytes, mismo origen). */
export function resolveLcpLocalRasterUrl(url: string): string {
  if (!url.startsWith(LCP_LOCAL_POSTER_DIR)) return url
  if (!/\.(png|jpe?g)$/i.test(url)) return url

  const webpUrl = url.replace(/\.(png|jpe?g)$/i, ".webp")
  const abs = join(process.cwd(), "public", webpUrl.slice(1))
  if (existsSync(abs)) return webpUrl
  return url
}
