# Roadmap 2.5.0 — Historial webhooks admin

Extiende [ROADMAP-2.4.md](./ROADMAP-2.4.md) (OAuth Apple / Microsoft).

## Entregado

| Entrega | Detalle |
|---------|---------|
| Historial | Lista en Upstash `qvh:webhook:history` tras cada cron con webhooks |
| Admin UI | Tabla en `/admin` → pestaña **Cron** |
| API | `GET /api/admin/webhooks/history?limit=20` (auth admin) |

Solo se guarda historial si hay al menos un partner con URL en `PARTNER_API_KEYS` y Upstash está configurado.

## Siguiente (2.6+)

- App Expo (API v1/v2)
- Reintentos webhook con backoff
- OAuth: errores por proveedor en callback
