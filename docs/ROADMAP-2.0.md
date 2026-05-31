# Roadmap 2.0.0 — Plataforma estable

Lanzamiento mayor tras **1.9.9 RC**: las optimizaciones 1.0.11→1.9.9 pasan a versión oficial **2.0.0**.

## Objetivo

| Pilar | Meta 2.0 |
|-------|------------|
| Rendimiento | PSI mobile ≥90; LCP ≤2s en presupuesto CI |
| API | ETag en home-feed, events y v2 |
| Producto | Feed unificado (paneles deportes/TV/cine) |
| Ops | `verify:prod:2.0` en deploy |

## Entregables 2.0.0

- `PRODUCT_VERSION = "2.0.0"`
- Hereda todo el RC 1.9.9 (imágenes w185, filtros debounce, prefetch CSS, dedup fetch)
- `npm run verify:prod:2.0` — superset de 1.9 + contrato 1.0
- CHANGELOG y novedades actualizados
- Scorecard global ≥9.4

## Verificación post-deploy

```bash
npm run verify:prod:2.0   # 14/14 OK en prod (keep-warm + contrato 2.0)
npm run verify:prod:1.0
PERF_URL=https://queveohoy.es PERF_BUDGET_LCP_MS=2000 npm run perf:budget
```

**PSI mobile prod (2026-05-31):** Performance **97**, LCP **1.92s** ✅ (meta ≤2s), CLS **0.000**. Comando: `PERF_URL=https://queveohoy.es npm run perf:budget`.

## Siguiente (2.1+)

Ver [ROADMAP.md](./ROADMAP.md) backlog: app nativa, API partners ampliada, métricas cron en admin.
