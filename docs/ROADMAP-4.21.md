# Roadmap 4.21.0 — Semana UFC Casablanca

Extiende [ROADMAP-4.20.md](./ROADMAP-4.20.md).

Release editorial + depuración + pipeline de deploy alineado con v4.

## Entregado

| Área | Entrega |
|------|---------|
| Editorial | Hero **UFC Casablanca** · Topuria vs Gaethje (Freedom 250) |
| UX | Temática global `data-site-week="ufc-casablanca"` |
| Feed | Tier `ufc-week` · prioridad sobre Champions en ventana editorial |
| Código | `ufc-week`, `UfcWeekHero`, `week-hero`, curated merge |
| Calidad | 307 tests · lint limpio · fix build `push-notify` |
| Ops | `npm run verify:prod` (versión dinámica + checks UFC) |
| Ops | `npm run release:prod` · deploy CI usa `verify-prod-current` |

## Verificación automatizada

```bash
npm run verify:prod          # smoke contra queveohoy.es
CRON_SECRET=... npm run release:prod   # verify + integraciones + IndexNow
```

El workflow **Deploy Production** ejecuta verify, keep-warm, rollover y cron post-deploy.

## Ventana editorial

- **Inicio:** 2026-05-30 (Madrid)
- **Fin:** 2026-06-15 (main event Topuria vs Gaethje)
