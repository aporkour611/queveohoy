/** Preferencia webp en rutas locales (seguro para cliente y servidor). */
export function preferLocalWebpUrl(url: string): string {
  if (!url.startsWith("/posters/") && !url.startsWith("/deportes/")) return url;
  if (!/\.(png|jpe?g)$/i.test(url)) return url;
  return url.replace(/\.(png|jpe?g)$/i, ".webp");
}
