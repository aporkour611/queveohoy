const CLIENT_FETCH_TIMEOUT_MS = 12_000;

export class ClientFetchTimeoutError extends Error {
  constructor() {
    super("La conexión tardó demasiado. Comprueba tu red e inténtalo de nuevo.");
    this.name = "ClientFetchTimeoutError";
  }
}

/** Fetch JSON en cliente con tope de espera (evita overlay de carga infinito). */
export async function fetchClientJson<T>(
  url: string,
  timeoutMs = CLIENT_FETCH_TIMEOUT_MS
): Promise<{ ok: boolean; status: number; body: T }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, { signal: controller.signal });
    const body = (await res.json()) as T;
    return { ok: res.ok, status: res.status, body };
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new ClientFetchTimeoutError();
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
