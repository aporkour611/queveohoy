/** Loader compacto al refrescar el feed (p. ej. Semana completa). */
export function FeedRefreshLoader() {
  return (
    <div className="qvh-feed-loader" role="status" aria-live="polite">
      <div className="qvh-feed-loader-brand" aria-hidden>
        <span className="qvh-feed-loader-tile qvh-feed-loader-tile-q" />
        <span className="qvh-feed-loader-tile qvh-feed-loader-tile-v" />
        <span className="qvh-feed-loader-tile qvh-feed-loader-tile-h" />
      </div>
      <span className="sr-only">Cargando eventos…</span>
    </div>
  );
}
