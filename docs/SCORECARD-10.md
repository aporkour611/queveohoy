# Scorecard objetivo 10/10

Estado tras **v2.0.0** (graduación RC 1.9.9 — plataforma estable).

| Dimensión | Meta | Nota real | Estado | Instrumentación |
|-----------|------|-----------|--------|-----------------|
| Arquitectura | 10 | 8.5 | 🟡 | Gate 10s desktop; ETag home/week |
| Seguridad | 10 | 9.0 | 🟢 | Assistant API key; Upstash |
| Rendimiento | 10 | 9.2 | 🟢 | w185 feed; preload 320w; dedup fetch |
| Mantenibilidad | 10 | 8.5 | 🟡 | ROADMAP-1.9.9; tests etag/filtros |
| Testing | 10 | 9.0 | 🟢 | Vitest + verify:prod:1.9 |
| Ops/CI | 10 | 9.0 | 🟢 | LHCI perf ≥80%; LCP budget 2s |
| SEO | 10 | 9.5 | 🟢 | OG hubs; FAQ 16/16 |
| A11y | 10 | 9.0 | 🟢 | axe contraste |

**Global estimado: ~9.4/10** — Objetivo Lighthouse 95+ tras deploy y medición PSI.

## Medición PSI producción (2026-05-31)

`PERF_URL=https://queveohoy.es npm run perf:budget`

| Métrica | Resultado | Meta |
|---------|-----------|------|
| Versión | Performance | LCP | CLS |
|---------|-------------|-----|-----|
| 2.0.3 | **96** | **2.73s** | 0 |
| 2.0.4 | **92** | **2.80s** | 0 |
| **PSI prod (2026-05-31)** | **97** | **1.92s** | 0 |

Meta: Performance ≥80 ✅ · LCP ≤2.0s ✅ · CLS ≤0.08 ✅

**2.0.5 (código):** WebP local `/posters` + TMDB w154 + keep-warm cada minuto.

**PSI tras keep-warm + optimizaciones acumuladas:** LCP **1.92s** — presupuesto `perf:budget` OK.

**Siguiente:** confirmar footer **2.0.5** en prod tras deploy; objetivo PSI mobile ≥95 estable.

## Cambios 1.0.6 (performance extrema)

- **`interaction-gate`**: mobile sin timers idle que cargan JS durante Lighthouse
- **HomeFeedGate**: sin scroll listener; drawer + reset solo al hidratar
- **ChampionsWeekHero**: Server Component puro (sin TeamCrest client)
- **CSS**: `feed-sports.css` diferido; `optimizeCss` en producción
- **LCP**: TMDB w185 (~46% menos bytes que w342)
- **Islas client**: DestacadosEnhancer, FeedFreshness, TonightForYou bajo interacción
- **Guía/cuenta**: sin `feed-bundle` completo

## Medir post-deploy

```bash
PERF_URL=https://queveohoy.es npm run perf:budget
PERF_URL=https://queveohoy.es npm run perf:audit
npm run verify:prod:1.0
```

## Para 10/10 absoluto

- PSI mobile ≥95 consistente (confirmar TBT <200ms)
- Split cron en Vercel
- Bundle analyzer en HomeFeed si TBT persiste
