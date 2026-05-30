# Scorecard objetivo 10/10

Estado tras optimización extrema **v1.0.6** (server-first, JS mínimo en PSI mobile).

| Dimensión | Meta | Nota real | Estado | Instrumentación |
|-----------|------|-----------|--------|-----------------|
| Arquitectura | 10 | 8.0 | 🟡 | Interaction gate; drawer/feed bajo demanda |
| Seguridad | 10 | 9.0 | 🟢 | Assistant API key; Upstash |
| Rendimiento | 10 | 9.0 | 🟢 | Sin auto-hydrate PSI; CSS crítico + defer |
| Mantenibilidad | 10 | 8.0 | 🟡 | `interaction-gate`; coverage CI |
| Testing | 10 | 9.0 | 🟢 | 235 Vitest; 23 E2E |
| Ops/CI | 10 | 8.5 | 🟡 | optimizeCss prod; LHCI perf ≥75% |
| SEO | 10 | 9.5 | 🟢 | OG hubs; FAQ 16/16 |
| A11y | 10 | 9.0 | 🟢 | axe contraste |

**Global estimado: ~9.2/10** — Objetivo Lighthouse 95+ tras deploy y medición PSI.

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
