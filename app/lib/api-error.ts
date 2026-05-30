/** Mensaje genérico para clientes en producción (evita filtrar detalles de DB). */
export function publicApiErrorMessage(
  detail: string | undefined | null,
  fallback = "Error interno del servidor"
): string {
  if (process.env.NODE_ENV !== "production") {
    return detail?.trim() || fallback
  }
  return fallback
}
