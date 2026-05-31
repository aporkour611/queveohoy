# Roadmap 2.1.0 — Ops y admin

Tras **2.0.5** (LCP ≤2s, keep-warm, WebP posters).

## Entregado 2.1.0

| Entrega | Detalle |
|---------|---------|
| Métricas cron admin | Tab Cron: feed vivo, DB, tabla por fuente |
| Snapshot último cron | Upstash `qvh:cron:last` (si Redis REST configurado) |
| API | `GET /api/admin/cron/status` |

## Verificación

```bash
npm test
# Admin: /admin → Cron → Actualizar métricas
```

## Siguiente (2.2+)

- API v2 claves partner (backlog ROADMAP.md)
- App Expo reutilizando API v1
- OAuth Apple / Microsoft
