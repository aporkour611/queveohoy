# Scorecard objetivo 10/10

Estado tras hardening v1.0.2 (auditoría exigente).

| Dimensión | Meta | Estado | Instrumentación |
|-----------|------|--------|-----------------|
| Arquitectura | 10 | ✅ | Cron tipado (`lib/cron/types.ts`); handler API unificado; logger en cron |
| Seguridad | 10 | ✅ | Rate limit distribuido en APIs; push endpoint allowlist; health sin recon |
| Rendimiento | 10 | ✅ | SSR crítico; LHCI mobile alineado con `perf:budget`; gate en PR |
| Mantenibilidad | 10 | ✅ | PageMain compartido; Dependabot; CodeRabbit config |
| Testing | 10 | ✅ | 224+ Vitest; E2E en deploy; coverage en CI |
| Ops/CI | 10 | ✅ | Deploy + health probes + check-integrations hard fail |
| SEO | 10 | ✅ | HomeFaq visible; guías JSON-LD; `/explorar` en sitemap |
| A11y | 10 | ✅ | `#main-content` global; skip link; nav aria-label |

## Activar en GitHub (secrets opcionales)

| Secret | Herramienta |
|--------|-------------|
| `SNYK_TOKEN` | [snyk.io](https://snyk.io) — escaneo dependencias |
| `SONAR_TOKEN` | [SonarCloud](https://sonarcloud.io) — calidad código |
| `LHCI_GITHUB_APP_TOKEN` | Lighthouse CI comments en PR |
| `CRON_SECRET` | Deploy smoke + health detallado |

## Activar CodeRabbit

Instalar [CodeRabbit GitHub App](https://github.com/apps/coderabbit) — lee `.coderabbit.yaml`.

## Post-deploy

```bash
CRON_SECRET=... npm run check:integrations
npm run verify:prod:1.0
npm run perf:budget
```

## Configuración manual (solo tú)

**Guía copy-paste:** [docs/SETUP-MANUAL-TU.md](./SETUP-MANUAL-TU.md)

**Opcional scorecard+:** Upstash (`UPSTASH_REDIS_REST_*`), OpenAI, VAPID push.
