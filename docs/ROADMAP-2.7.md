# Roadmap 2.7.0 — Partners, auth y app móvil

Extiende [ROADMAP-2.6](./VERCEL-PRO-AUDIT.md) (auditoría Vercel Pro + rollover calendario).

## Entregado

| Entrega | Detalle |
|---------|---------|
| Webhooks | Reintentos con backoff (3×, 500ms→1s→2s) en 5xx/429 |
| OAuth | Errores legibles por proveedor en `/auth/callback` → `/cuenta/login` |
| PSI gate | Presupuesto LCP ≤3s en deploy (warning); `PERF_GATE_BLOCKING=1` para bloquear |
| App Expo | Scaffold `mobile/` — agenda vía `GET /api/v1/feed` |

## Siguiente (2.8+)

Ver [ROADMAP-2.8.md](./ROADMAP-2.8.md) (entregado).

- EAS Build en CI + TestFlight / Play Internal
- Push Expo
- Apple OAuth en Supabase (manual dashboard)
- Activar `PERF_GATE_BLOCKING` cuando LCP ≤3s sea estable 2 semanas
