import { BrandLoader } from "./BrandLoader"

/** Overlay fijo al refrescar el feed, filtrar o cargar la vista semanal. */
export function FeedRefreshLoader() {
  return <BrandLoader variant="fixed" />
}
