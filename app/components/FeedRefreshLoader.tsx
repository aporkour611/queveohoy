import { BrandLoader } from "./BrandLoader"

/** Overlay al refrescar el feed o cargar la vista semanal. */
export function FeedRefreshLoader() {
  return <BrandLoader variant="overlay" />
}
