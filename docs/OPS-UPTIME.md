# Disponibilidad — sin inactividad

## No depende de Cursor

La producción (`queveohoy.es`) vive en **Vercel + Supabase**. Cursor no la mantiene encendida.

## Plan Vercel Pro (v2.6.0)

- **Fluid compute** (`"fluid": true`) — menos cold start.
- **CPU Performance** en cron/warm (`memory: 3009` en `vercel.json`).
- Auditoría completa: [VERCEL-PRO-AUDIT.md](./VERCEL-PRO-AUDIT.md).

## Mantenimiento automático

| Canal | Frecuencia | Qué hace |
|-------|------------|----------|
| **Cron Vercel** `GET /api/health?warm=1&origins=0` | Cada **5 min** | Cachés Supabase + `unstable_cache` (sin precalentar `/`) |
| **Cron Vercel** `GET /api/warm` | Cada **15 min** | Ciclo completo + home/explorar |
| **GitHub Actions** `keep-warm.yml` | Cada **15 min** | Respaldo (`KEEP_WARM_FULL=1`) |
| **push-cron.yml** | Cada 15 min | Solo notificaciones push |
| **deploy.yml** | Tras cada deploy | Keep-warm completo |

Vercel envía `Authorization: Bearer CRON_SECRET` en crons (configura `CRON_SECRET` en el proyecto).

## Comprobar

```bash
CRON_SECRET=... KEEP_WARM_FULL=1 npm run keep-warm:prod
curl -sS -H "Authorization: Bearer $CRON_SECRET" "https://queveohoy.es/api/health?warm=1&origins=0"
```

`/api/health` sin `?warm=1` es **ligero** (COUNT en BD, no carga el feed entero).

## Supabase pausado (plan gratis, ~7 días sin tráfico)

Los pings cada 5 min **evitan** la pausa por inactividad en condiciones normales. Si el proyecto ya está pausado en el dashboard, pulsa **Restore** una vez.

## Si aún falla

1. Variables `SUPABASE_*`, `CRON_SECRET` y **Upstash** en Vercel Production.
2. Actions → **Keep warm** → últimos runs en verde.
3. Vercel → Cron Jobs → revisar horarios en `vercel.json`.
