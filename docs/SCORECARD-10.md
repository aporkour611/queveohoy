# Scorecard objetivo 10/10

Estado honesto tras auditoría ultra-exigente — **v1.0.3**.

| Dimensión | Meta | Nota real | Estado | Instrumentación |
|-----------|------|-----------|--------|-----------------|
| Arquitectura | 10 | 7.0 | 🟡 | Cron monolítico; tipos cron listos |
| Seguridad | 10 | 7.5 | 🟡 | Health sin recon; Upstash opcional |
| Rendimiento | 10 | 5.5 | 🔴 | PartidoPage client; LHCI no bloqueante |
| Mantenibilidad | 10 | 7.5 | 🟡 | PageMain; logger parcial |
| Testing | 10 | 8.0 | 🟢 | 227+ Vitest; E2E deploy |
| Ops/CI | 10 | 7.5 | 🟡 | Gates deploy; branch protection manual |
| SEO | 10 | 7.5 | 🟡 | FAQ home; hubs sin OG dinámico |
| A11y | 10 | 6.5 | 🟡 | main-content global; sin axe gate |

**Global: ~7.2/10** — Ver [AUDITORIA-ULTRA-1.0.3.md](./AUDITORIA-ULTRA-1.0.3.md)

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
