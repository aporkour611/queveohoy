import { headers } from "next/headers"

/** Señal de middleware: omitir client islands en HTML (PSI/Lighthouse). */
export async function shouldDeferHeavyServer(): Promise<boolean> {
  const headerStore = await headers()
  return headerStore.get("x-qvh-defer") === "1"
}
