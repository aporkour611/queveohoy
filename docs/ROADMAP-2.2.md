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

## Siguiente

Ver [ROADMAP-2.3.md](./ROADMAP-2.3.md) (webhooks ✅) y backlog 2.4+ en [ROADMAP.md](./ROADMAP.md).
