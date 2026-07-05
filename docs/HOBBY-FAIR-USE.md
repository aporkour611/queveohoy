# Hobby fair-use — tráfico automático a prod

Queveohoy **no requiere Vercel Pro**. El bloqueo de julio 2026 fue por **abuso de tráfico automatizado**, no por el plan.

## Presupuesto GHA (tras 6.2.4)

| Workflow | Qué hace | Frecuencia | ~req/día |
|----------|----------|------------|----------|
| `keep-warm.yml` | 5 APIs ligeras | cada **15 min** | ~480 |
| `keep-warm-full.yml` | APIs + 11 hubs HTML | **4×/día** (0:05, 6:05, 12:05, 18:05 UTC) | ~64 |
| `cron-schedule.yml` | `/api/cron` | 6×/día | ~6 |
| `push-cron.yml` | `/api/push/cron` | cada **30 min** | ~48 |
| `midnight-rollover.yml` | rollover Madrid | 1×/día efectivo | ~1 |

**Total automático estimado: ~600 peticiones/día** a edge (sin usuarios reales).

### Antes (causa del bloqueo)

| Fuente | ~req/día |
|--------|----------|
| keep-warm cada **3 min** + `KEEP_WARM_FULL=1` | **>7 000** |
| maratón local contra prod | **millones** |

## Reglas

1. **Nunca** `npm run marathon:*` contra prod sin unpause explícito (`MARATHON_ALLOW_PROD=1`).
2. **No** bajar intervalos de keep-warm por debajo de 15 min en Hobby.
3. **Full warm HTML** solo en `keep-warm-full.yml` o post-deploy (una vez).
4. Mientras Vercel pause: `docs/PROD_VERCEL_PAUSED` → GHA no toca prod.
5. Probes locales: respetan backoff 24 h si `DEPLOYMENT_DISABLED`.

## Comandos

```bash
# Solo APIs (seguro)
npm run keep-warm:prod

# APIs + hubs (usar con moderación)
npm run keep-warm:prod:full
```

## Reactivar prod

Ver [VERCEL-UNPAUSE.md](./VERCEL-UNPAUSE.md). **No hace falta Pro** — ticket Hobby unpause + borrar `PROD_VERCEL_PAUSED`.
