import type { Metadata } from "next"

/** Metadata para áreas privadas (no indexar). */
export function privateAreaMetadata(title: string): Metadata {
  return {
    title,
    robots: {
      index: false,
      follow: false,
      googleBot: { index: false, follow: false },
    },
  }
}
