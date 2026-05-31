/**
 * Fetch con tope de tiempo para clientes Supabase en serverless.
 * Evita funciones colgadas cuando Postgres/Supabase despierta tras idle.
 */
export function createSupabaseFetch(timeoutMs: number): typeof fetch {
  return (input, init) => {
    const signals: AbortSignal[] = []
    if (init?.signal) signals.push(init.signal)
    if (typeof AbortSignal.timeout === "function") {
      signals.push(AbortSignal.timeout(timeoutMs))
    }

    const signal =
      signals.length > 1 && typeof AbortSignal.any === "function"
        ? AbortSignal.any(signals)
        : signals[0]

    return fetch(input, { ...init, signal })
  }
}
