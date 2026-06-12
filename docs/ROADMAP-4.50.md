# Roadmap 4.50 — Cierre Maratón 8

**Maratón 8** · ciclos **211–240** · versión objetivo **4.50.0**  
**Tema:** quality ≥95% Fase 2

## Entregables

| Ciclo | Entrega |
|-------|---------|
| 211–215 | Baseline quality, tests scorecard/marathon, probe CDN multi-endpoint, headers en verify-prod |
| 216–220 | npm audit prod-only, validate, verify:prod |
| 221–240 | Iteración quality LCP/CDN, índice maestro 8–2000, cierre |

## Programa global (2000 maratones)

Progresión de oleadas: **1 → +10 → +10 → … → 1000 → +1000 → 2000**.

```bash
npm run marathon:batch      # oleadas + índice docs/marathon-master-index.json
npm run marathon:wave -- --target=1000
npm run marathon:program
```

## Completados

- Maratones 1–8: 240 ciclos (v4.50.0)
- Maratón 9+: sostener ≥95% en los 20 rankings

## Siguiente

Maratón 9 (ciclos 241–270): sostener ≥95% en los 20 rankings tras warm-up prod.
