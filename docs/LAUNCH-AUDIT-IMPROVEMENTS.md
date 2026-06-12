# Propuesta de mejoras — maratón

Generado: 2026-06-12T21:07:40.961Z
Maratón: cwv-2000 · 3 / 2000 ciclos
Versión producto: 5.2.1

## Aplicado (v5.1.1)

- CWV gate: LCP ≤2.5s · FID ≤100ms · CLS ≤0.1 (`npm run cwv:audit`)
- Defer SW, CalendarDayRefresh, FilterCssIntent · layout client chunks lazy
- Preload LCP UFC en feed layout + fetchPriority low en retrato secundario
- Quality gate 20/20 ≥95% (LCP, CDN, PWA, E2E, deps)
- Retratos UFC locales WebP + CSS crítico + preload Link header
- ETag + Cache-Control en APIs feed
- PWA offline shell + manifest completo
- E2E prod + week=1 URL bootstrap
- robots.txt estático · postcss override

## Sostenimiento

- `npm run keep-warm:prod` antes de quality:audit con LH completo
- Maratón FAST reutiliza `lighthouse-quality-audit.json`

## Fallos en maratón

- Ciclo 243 [audit-baseline] quality:audit: exit 1
