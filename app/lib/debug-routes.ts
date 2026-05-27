/** Rutas de diagnóstico desactivadas en producción salvo override explícito. */
export function isDebugRouteDisabled(): boolean {
  return (
    process.env.NODE_ENV === "production" &&
    process.env.ALLOW_DEBUG_ROUTES !== "true"
  );
}
