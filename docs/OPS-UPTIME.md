# Disponibilidad — sin inactividad

## No depende de Cursor

La producción (`queveohoy.es`) vive en **Vercel + Supabase**. Cursor no la mantiene encendida.

## Mantenimiento automático

| Canal | Frecuencia | Qué hace |
|-------|------------|----------|
| **Cron Vercel** `GET /api/health?warm=1` | **Cada 1 minuto** | Ciclo completo keep-warm (Bearer `CRON_SECRET`) |
| **Cron Vercel** `GET /api/warm` | Cada 5 min | Alias dedicado (mismo ciclo) |
| **GitHub Actions** `keep-warm.yml` | Cada **5 min** (máx. GHA) | `scripts/keep-warm-prod.mjs` (respaldo) |
| **push-cron.yml** | Cada 15 min | Keep-warm + notificaciones push |
| **deploy.yml** | Tras cada deploy | Keep-warm completo |

Vercel envía `Authorization: Bearer CRON_SECRET` en crons (configura `CRON_SECRET` en el proyecto).

## Comprobar

```bash
npm run keep-warm:prod
curl -sS -H "Authorization: Bearer $CRON_SECRET" "https://queveohoy.es/api/health?warm=1"
```

Respuesta esperada: `"ok": true`, eventos > 0, orígenes con HTTP 200.

## Supabase pausado (plan gratis, ~7 días sin tráfico)

Los pings cada minuto **evitan** la pausa por inactividad en condiciones normales. Si el proyecto ya está pausado en el dashboard, hay que pulsar **Restore** una vez; después el keep-warm lo mantiene despierto.

## Si aún falla

1. Variables `SUPABASE_*` y `CRON_SECRET` en Vercel Production.
2. Actions → **Keep warm** → últimos runs en verde.
3. Vercel → Project → Cron Jobs → `/api/warm` activo cada minuto.
