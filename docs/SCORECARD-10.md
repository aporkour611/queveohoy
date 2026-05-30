# Scorecard objetivo 10/10

Estado honesto tras correcciones multi-dimensión — **v1.0.3+** (pendiente deploy).

| Dimensión | Meta | Nota real | Estado | Instrumentación |
|-----------|------|-----------|--------|-----------------|
| Arquitectura | 10 | 7.0 | 🟡 | Cron monolítico; tipos cron listos |
| Seguridad | 10 | 8.0 | 🟡 | Assistant 410; rate limit distribuido en APIs |
| Rendimiento | 10 | 6.5 | 🟡 | PartidoPage SSR; mobile hydrate-on-interact |
| Mantenibilidad | 10 | 7.5 | 🟡 | PageMain; logger parcial |
| Testing | 10 | 8.5 | 🟢 | 233 Vitest; axe E2E; CI Supabase unset |
| Ops/CI | 10 | 8.0 | 🟡 | LHCI a11y/seo gate; perf budget realista |
| SEO | 10 | 8.0 | 🟡 | OG en hubs; FAQ 8 hubs |
| A11y | 10 | 7.5 | 🟡 | main-content login; axe gate (sin contraste) |

**Global estimado: ~7.8/10** — Ver [AUDITORIA-ULTRA-1.0.3.md](./AUDITORIA-ULTRA-1.0.3.md) y [PERF-AUDIT-RESUMEN.md](./PERF-AUDIT-RESUMEN.md)

## Cambios 1.0.3 (deploy)

- Health: integraciones solo con `Authorization: Bearer CRON_SECRET`
- E2E CI: sin env Supabase (fix deploy #150)
- Rate limit `/api/home-feed`
- Secretos eliminados de `docs/PASOS-SOLO-TU.md`

## Activar en GitHub (secrets opcionales)

| Secret | Herramienta |
|--------|-------------|
| `SNYK_TOKEN` | [snyk.io](https://snyk.io) |
| `SONAR_TOKEN` | [SonarCloud](https://sonarcloud.io) |
| `LHCI_GITHUB_APP_TOKEN` | Lighthouse CI comments en PR |
| `CRON_SECRET` | Deploy smoke + health detallado |

## Post-deploy

```bash
CRON_SECRET=... npm run check:integrations
npm run verify:prod:1.0
npm run perf:budget
```

## Configuración manual

**Guía:** [docs/PASOS-SOLO-TU.md](./PASOS-SOLO-TU.md)

**Urgente si usaste ADMIN_SECRET de docs antiguos:** rotar en Vercel + nuevo deploy.
