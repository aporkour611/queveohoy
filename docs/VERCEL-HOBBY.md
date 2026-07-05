# Vercel Hobby (sin Pro)

Migración tras baja de Vercel Pro. Presupuesto de tráfico: [HOBBY-FAIR-USE.md](./HOBBY-FAIR-USE.md).

## Quitado (solo Pro)

| Antes (Pro) | Ahora (Hobby) |
|-------------|----------------|
| `"fluid": true` | Eliminado |
| `"regions": ["cdg1"]` | Región por defecto Vercel |
| `memory: 3009` en cron/warm | Memoria por defecto (1024 MB) |
| 11 crons en `vercel.json` | **0** — todo en GitHub Actions |
| `maxDuration` 60–120 s | **10 s** (límite Hobby) |
| `deploymentEnabled: false` | **`true`** (deploy desde git) |

## Programación (GitHub Actions) — 6.2.4

| Tarea | Workflow | Frecuencia |
|-------|----------|------------|
| Keep-warm **APIs** | `keep-warm.yml` | Cada **15 min** |
| Keep-warm **HTML** (hubs ISR) | `keep-warm-full.yml` | **4×/día** UTC |
| Ingesta cron core/extended | `cron-schedule.yml` | 6h / 12h / 18h UTC |
| Rollover Madrid | `midnight-rollover.yml` | 22h y 23h UTC |
| Push notifications | `push-cron.yml` | Cada **30 min** |

## Límite 10 s en funciones

`/api/cron` y `/api/midnight-rollover` pueden **no completar** en una sola invocación Hobby. Los workflows GHA siguen llamándolos; si fallan por timeout, el rollover también ejecuta TMDB/posters **en el runner** (`midnight-rollover.yml`).

Warm completo de páginas: `npm run keep-warm:prod:full` o workflow `keep-warm-full.yml`, no cada 15 min.

## Manual

1. Vercel dashboard → confirmar plan **Hobby** (no necesitas Pro).
2. GitHub → Secrets: `CRON_SECRET`, `VERCEL_TOKEN` para `deploy.yml`.
3. Tras unpause: quitar `docs/PROD_VERCEL_PAUSED`, push, `npm run verify:prod`.
