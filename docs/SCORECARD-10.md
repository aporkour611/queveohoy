# Scorecard objetivo 10/10

| Dimensión | Meta | Instrumentación |
|-----------|------|-----------------|
| Arquitectura | 10 | Cron en `lib/cron/`; handler API unificado; hooks HomeFeed |
| Seguridad | 10 | CodeQL + Trivy + npm audit + Snyk (secret); OAuth hardening |
| Rendimiento | 10 | SSR crítico; LHCI + `perf:budget` |
| Mantenibilidad | 10 | Cron modularizado; Dependabot; CodeRabbit |
| Testing | 10 | 219+ Vitest; E2E smoke + quality; coverage script |
| Ops/CI | 10 | Deploy + verify-prod-1.0; logger JSON; push cron |
| SEO | 10 | Metadata dinámica; noindex privado |
| A11y | 10 | Landmarks; LHCI a11y ≥95; aria-busy shell |

## Activar en GitHub (secrets)

| Secret | Herramienta |
|--------|-------------|
| `SNYK_TOKEN` | [snyk.io](https://snyk.io) — escaneo dependencias |
| `SONAR_TOKEN` | [SonarCloud](https://sonarcloud.io) — calidad código |
| `LHCI_GITHUB_APP_TOKEN` | Lighthouse CI comments en PR |

## Activar CodeRabbit

Instalar [CodeRabbit GitHub App](https://github.com/apps/coderabbit) — lee `.coderabbit.yaml`.

## Post-deploy

```bash
npm run verify:prod:1.0
npm run perf:budget
```
