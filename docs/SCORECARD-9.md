# Mejoras hacia scorecard ≥ 9/10

Documento de seguimiento tras auditoría externa. Objetivo: **≥ 9/10** en cada dimensión.

| Dimensión | Antes | Meta | Cambios aplicados |
|-----------|-------|------|-------------------|
| Arquitectura SSR/RSC | 8 | 9+ | Home SSR restaurado; handler feed unificado; hooks HomeFeed |
| Seguridad | 5 | 9+ | Open redirect; cron auth; push userId; admin 24h; debug prod off |
| Rendimiento | 6 | 9+ | TonightStatic + FeedFreshnessSlot; FeedControls lazy; logo SSR |
| Mantenibilidad | 5 | 9+ | public-feed-handler; hooks; fetchEventById; rate limit distribuido |
| Testing | 6 | 9+ | E2E quality + a11y; tests hardening |
| Ops/CI | 7 | 9+ | Logger JSON; npm audit CI; push cron; .env.example |
| SEO | 8 | 9+ | Metadata home dinámica; noindex cuenta/admin |
| A11y | 7 | 9+ | FeedControlsShell aria-busy; E2E landmarks |

## Pendiente para 9+ sostenido

1. **Upstash** — configurar `UPSTASH_REDIS_REST_*` en Vercel Production
2. **Partir cron** — `app/lib/cron/orchestrator.ts` (940 LOC → módulos)
3. **Partir HomeFeed** — `components/home-feed/*` (objetivo <400 LOC por archivo)
4. **Sentry** — `SENTRY_DSN` + `@sentry/nextjs` (observabilidad)
5. **Lighthouse CI** — perf budget en PR (no solo manual)

## Verificación

```bash
npm run test
npm run build
npm run test:e2e
```

Tras deploy: `npm run verify:prod:1.0`
