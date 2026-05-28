/** Segundos de caché ISR / CDN para el feed de eventos. */
export const FEED_REVALIDATE_SECONDS = 900;

/**
 * Límite de espera a Supabase en SSR. Debe quedar por debajo del timeout de
 * funciones en Vercel (~10s en Hobby) para devolver HTML vacío en vez de 5xx.
 */
export const FEED_QUERY_TIMEOUT_MS = 5_000;

/** Tope de filas por consulta al feed (evita bloqueos en SSR / PSI). */
export const FEED_QUERY_ROW_LIMIT = 600;
