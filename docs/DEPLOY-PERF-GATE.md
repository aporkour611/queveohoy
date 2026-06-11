# Activar PERF gate bloqueante

Infra lista desde **v2.7**. El deploy ejecuta Lighthouse PSI post-producción; por defecto **no bloquea** si LCP > 3 s.

## Cuándo activar

- LCP móvil estable **≤ 3 s** durante **2 semanas** en producción
- `npm run verify:prod` en verde de forma consistente

## Cómo activar

1. GitHub → repositorio → **Settings** → **Secrets and variables** → **Actions** → **Variables**
2. Nueva variable: `PERF_GATE_BLOCKING` = `1`
3. El siguiente deploy fallará si `npm run perf:budget` incumple LCP o score mínimo

## Desactivar temporalmente

- Elimina la variable o pon `PERF_GATE_BLOCKING=0`
- El workflow sigue emitiendo `::warning::` sin tumbar el deploy

## Referencias

- `.github/workflows/deploy.yml` — paso «PSI presupuesto LCP en producción»
- `scripts/perf-budget.mjs` — lee `PERF_GATE_BLOCKING`
- [ROADMAP-2.7.md](./ROADMAP-2.7.md)
