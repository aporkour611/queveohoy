import type { Metadata } from "next"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  robots: { index: false, follow: true },
}

/** El chat «¿Qué veo?» se sustituyó por búsqueda inteligente en la home. */
export default function AsistentePage() {
  redirect("/#feed-controls")
}
