# Vercel Hobby (sin Pro)

Migración tras baja de Vercel Pro. Detalle operativo en [OPS-UPTIME.md](./OPS-UPTIME.md).

## Quitado (solo Pro)

| Antes (Pro) | Ahora (Hobby) |
|-------------|----------------|
| `"fluid": true` | Eliminado |
| `"regions": ["cdg1"]` | Región por defecto Vercel |
| `memory: 3009` en cron/warm | Memoria por defecto (1024 MB) |
| 11 crons en `vercel.json` | **0** — todo en GitHub Actions |
| `maxDuration` 60–120 s | **10 s** (límite Hobby) |
| `deploymentEnabled: false` | **`true`** (deploy desde git) |

## Programación (GitHub Actions)

| Tarea | Workflow | Frecuencia |
|-------|----------|------------|
| Keep-warm APIs + ISR | `keep-warm.yml` | Cada **5 min** |
| Ingesta cron core/extended | `cron-schedule.yml` | 6h / 12h / 18h UTC |
| Rollover Madrid | `midnight-rollover.yml` | 22h y 23h UTC |
| Push notifications | `push-cron.yml` | Cada 15 min |

## Límite 10 s en funciones

`/api/cron` y `/api/midnight-rollover` pueden **no completar** en una sola invocación Hobby. Los workflows GHA siguen llamándolos; si fallan por timeout, el rollover también ejecuta TMDB/posters **en el runner** (`midnight-rollover.yml`).

Warm completo de páginas: `KEEP_WARM_FULL=1 npm run keep-warm:prod` (local o GHA), no `/api/warm` con todos los orígenes.

## Manual

1. Vercel dashboard → confirmar plan **Hobby**.
2. GitHub → Secrets: `CRON_SECRET`, `VERCEL_TOKEN` para `deploy.yml`.
3. Tras deploy: `npm run verify:prod` y `npm run keep-warm:prod`.
