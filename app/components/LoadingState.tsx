import { BrandLoader } from "./BrandLoader"

export function LoadingState({ label = "Cargando eventos..." }: { label?: string }) {
  return <BrandLoader variant="inline" label={label} />
}
