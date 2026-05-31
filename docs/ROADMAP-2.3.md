# Roadmap 2.3.0 — Webhooks partners

Extiende [ROADMAP-2.2.md](./ROADMAP-2.2.md) (claves API v2).

## Entregado

| Entrega | Detalle |
|---------|---------|
| Webhook URL en clave | `PARTNER_API_KEYS=secret:Label\|https://hook` |
| Evento | `feed.updated` tras cron |
| Firma | `X-Queveohoy-Signature: sha256=<hmac>` con la clave API |

## Ejemplo Vercel

```
PARTNER_API_KEYS=sk_live_abc:MiMedio|https://api.mimedio.es/qvh/feed-updated
```

## Siguiente (2.4+)

- App Expo (API v1/v2)
- OAuth Apple / Microsoft en `/cuenta/login`
- Panel admin: historial de entregas webhook
