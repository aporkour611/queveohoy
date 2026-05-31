# Roadmap 2.2.0 — API partners

## Entregado

| Entrega | Detalle |
|---------|---------|
| Claves partner | `PARTNER_API_KEYS=secreto:Etiqueta,...` |
| `GET /api/v2/feed` | `X-API-Key` o Bearer; 300 req/min (configurable) |
| Errores | `401` clave inválida; `429` rate limit |
| Docs | `docs/API.md`, `/desarrolladores` |

## Configuración Vercel

```
PARTNER_API_KEYS=sk_live_xxx:MiMedio
PARTNER_API_RATE_LIMIT=300
```

Recomendado: `UPSTASH_REDIS_REST_*` para rate limit por partner.

## Siguiente (2.3+)

- App Expo (API v1/v2)
- OAuth Apple / Microsoft
- Webhooks de cambios en feed para partners Pro
