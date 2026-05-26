const DEFAULT_TIMEOUT_MS = 20_000;

export type FetchJsonResult<T> = {
  ok: boolean;
  status: number;
  data: T | null;
  error?: string;
};

/** Fetch JSON con timeout para evitar cuelgues en cron y SSR. */
export async function fetchJsonWithTimeout<T = unknown>(
  url: string,
  init?: RequestInit,
  timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<FetchJsonResult<T>> {
  try {
    const res = await fetch(url, {
      ...init,
      signal: AbortSignal.timeout(timeoutMs),
    });

    let data: T | null = null;
    try {
      data = (await res.json()) as T;
    } catch {
      data = null;
    }

    if (!res.ok) {
      const message =
        data && typeof data === "object" && "message" in data
          ? String((data as { message?: unknown }).message)
          : `HTTP ${res.status}`;
      return { ok: false, status: res.status, data, error: message };
    }

    return { ok: true, status: res.status, data, error: undefined };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, status: 0, data: null, error: message };
  }
}

/** Ejecuta tareas en paralelo con límite de concurrencia. */
export async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const current = index++;
      results[current] = await fn(items[current]);
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => worker()
  );
  await Promise.all(workers);
  return results;
}
