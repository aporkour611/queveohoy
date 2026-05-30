/** Rutas de diagnóstico desactivadas en producción (override ignorado). */
export function isDebugRouteDisabled(): boolean {
  return process.env.NODE_ENV === "production"
}
