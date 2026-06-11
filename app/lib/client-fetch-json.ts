const CLIENT_FETCH_TIMEOUT_MS = 12_000;

export type FetchResult<T> = {
  ok: boolean;
  status: number;
  body: T;
  /** true cuando el servidor respondió 304 (body vacío, datos sin cambios). */
  notModified?: boolean;
};

const inflightJson = new Map<string, Promise<FetchResult<unknown>>>();
const etagByUrl = new Map<string, string>();

export class ClientFetchTimeoutError extends Error {
  constructor() {
    super("La conexión tardó demasiado. Comprueba tu red e inténtalo de nuevo.");
    this.name = "ClientFetchTimeoutError";
  }
}

function storeEtag(url: string, res: Response): void {
  const etag = res.headers.get("etag")?.trim();
  if (etag) etagByUrl.set(url, etag);
}

/** Calienta caché CDN/navegador sin parsear JSON (comparte ETag con fetchClientJson). */
export async function warmClientFeedUrl(
  url: string,
  timeoutMs = CLIENT_FETCH_TIMEOUT_MS
): Promise<void> {
  const cachedEtag = etagByUrl.get(url);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: cachedEtag ? { "If-None-Match": cachedEtag } : undefined,
    });
    storeEtag(url, res);
    if (res.status === 304) return;
    await res.arrayBuffer();
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new ClientFetchTimeoutError();
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

/** Fetch JSON en cliente con tope de espera y revalidación condicional (ETag). */
export async function fetchClientJson<T>(
  url: string,
  timeoutMs = CLIENT_FETCH_TIMEOUT_MS
): Promise<FetchResult<T>> {
  const existing = inflightJson.get(url);
  if (existing) return existing as Promise<FetchResult<T>>;

  const promise = (async (): Promise<FetchResult<T>> => {
    const cachedEtag = etagByUrl.get(url);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: cachedEtag ? { "If-None-Match": cachedEtag } : undefined,
      });

      if (res.status === 304) {
        return { ok: true, status: 304, body: {} as T, notModified: true };
      }

      storeEtag(url, res);
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
  })().finally(() => {
    inflightJson.delete(url);
  });

  inflightJson.set(url, promise as Promise<FetchResult<unknown>>);
  return promise;
}

export function resetClientFetchInflightForTests(): void {
  inflightJson.clear();
  etagByUrl.clear();
}
