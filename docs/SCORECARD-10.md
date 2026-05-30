# Scorecard objetivo 10/10

Estado tras correcciones **v1.0.5** (mobile sin auto-hydrate, hub OG, FAQ 16/16, contraste, assistant hardening).

| Dimensión | Meta | Nota real | Estado | Instrumentación |
|-----------|------|-----------|--------|-----------------|
| Arquitectura | 10 | 7.5 | 🟡 | Cron monolítico; tipos listos para split |
| Seguridad | 10 | 9.0 | 🟢 | Assistant API key opcional; feed cache 60s; Upstash |
| Rendimiento | 10 | 8.5 | 🟡 | Mobile hydrate-on-interact; hub-shell.css |
| Mantenibilidad | 10 | 8.0 | 🟡 | PageMain; coverage thresholds CI |
| Testing | 10 | 9.0 | 🟢 | Vitest + thresholds; axe contraste; E2E 23 |
| Ops/CI | 10 | 8.5 | 🟡 | Gate deploy; LHCI a11y/seo |
| SEO | 10 | 9.5 | 🟢 | OG 1200×630 hubs; FAQ 16/16 |
| A11y | 10 | 9.0 | 🟢 | Contraste corregido; axe sin exclusions |

**Global estimado: ~9.0/10** — Ver [PERF-AUDIT-RESUMEN.md](./PERF-AUDIT-RESUMEN.md)

## Cambios 1.0.5

- **Perf:** mobile sin timer 8s en `HomeFeedGate` (solo interacción/scroll); CSS hubs ligero (`hub-shell.css`)
- **SEO:** `opengraph-image` dinámico por hub; FAQ en motogp, baloncesto, tenis, ciclismo, esports, copa-del-rey, series
- **A11y:** `--qvh-text-muted` y meta media/freshness; axe `color-contrast` activo en E2E
- **Seguridad:** `ASSISTANT_API_KEY` opcional; rate 5/min con OpenAI; cache feed 60s
- **CI:** Vitest coverage thresholds (lines 55%, branches 44%)

## Para llegar a 10/10

| Gap | Acción |
|-----|--------|
| PSI mobile ≥92 | Medir post-1.0.5; posible split HomeFeed bundle |
| Cron split | `/api/cron/football` + `/api/cron/media` en vercel.json |
| Upstash prod | `check:integrations` con CRON_SECRET |
| Sonar/Trivy verde | Secrets + `.trivyignore` triaged |

## Post-deploy

```bash
CRON_SECRET=... npm run check:integrations
npm run verify:prod:1.0
PERF_URL=https://queveohoy.es npm run perf:budget
```

## Configuración manual

**Guía:** [docs/PASOS-SOLO-TU.md](./PASOS-SOLO-TU.md)

Opcional en Vercel: `ASSISTANT_API_KEY`, `PAGESPEED_API_KEY`
