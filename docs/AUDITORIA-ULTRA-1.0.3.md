# Auditoría ultra-exigente — QueveoHoy 1.0.3

Fecha: 2026-05-30 · Metodología: revisión código + prod + CI + OWASP-lite + WCAG 2.2 AA muestra

**Nota global honesta: 7.2 / 10** (no 10/10 — ver gaps)

---

## Resumen ejecutivo

| Dimensión | Nota | Tendencia vs 1.0.1 |
|-----------|------|---------------------|
| Seguridad | **7.5** | ↑ (health recon cerrado en 1.0.3) |
| SEO | **7.5** | ↑ (FAQ home, JSON-LD guías, sitemap) |
| A11y | **6.5** | ↑ (main-content global) |
| Performance | **5.5** | → (PartidoPage client, CSS feed en hubs) |
| Testing | **8.0** | ↑ (227 Vitest + E2E deploy) |
| Ops/CI | **7.5** | ↑ (gates deploy; E2E fix CI) |
| Arquitectura | **7.0** | → (cron monolítico ~940 LOC) |
| Mantenibilidad | **7.5** | ↑ (PageMain, logger parcial) |

---

## Seguridad (7.5/10)

### ✅ Corregido en 1.0.3
- `/api/health?detailed=1` ya no expone integraciones sin auth
- `ADMIN_SECRET` eliminado de docs y script de import
- Rate limit en `/api/home-feed`

### ⚠️ Pendiente alto
| ID | Hallazgo | Riesgo | Acción |
|----|----------|--------|--------|
| S1 | Upstash opcional → rate limit in-memory por instancia | Medio | Activar Upstash en prod |
| S2 | `/api/assistant` sin auth (solo IP rate limit) | Medio | API key o sesión |
| S3 | Rotar `ADMIN_SECRET` si se usó valor de docs antiguos | Alto | Generar nuevo en Vercel |
| S4 | Prod 1.0.1 aún expone `integrations` en health público | Alto | Deploy 1.0.3 |
| S5 | Cron monolítico — blast radius alto | Medio | Partir `run-cron.ts` |

### ✅ Bien
- CRON/ADMIN con timing-safe compare
- Push subscribe allowlist
- robots disallow `/cuenta`, `/embed`
- CodeQL + Trivy en CI

---

## SEO (7.5/10)

### ✅
- HomeFaq visible + schema
- Guías con JSON-LD
- `/explorar` en sitemap
- feed.xml, sitemap.xml, robots.ts

### ⚠️
- Hubs agenda sin OG dinámico por hub
- FAQ schema solo en home (no en 15 hubs)
- Sin hreflang (solo ES — OK si mercado único)

---

## A11y (6.5/10)

### ✅
- `#main-content` en home, 404, guías, legal, cuenta
- Skip link funcional
- `aria-label` en nav principal

### ⚠️
- Contraste neon en algunos chips (no auditado con axe en CI)
- Tabs admin sin patrón roving tabindex
- E2E a11y básico (landmarks), sin axe-playwright gate

---

## Performance (5.5/10)

### ⚠️
- `PartidoPage` sigue siendo client component
- CSS feed cargado en hubs/partido
- LHCI en PR con `continue-on-error` (no bloquea)
- Sin RUM (Vercel Speed Insights no verificado)

### ✅
- SSR home feed
- API v2 ETag 304
- `optimizePackageImports`, lazy dynamic imports

---

## Testing (8.0/10)

### ✅
- 227+ Vitest, health route test nuevo
- E2E smoke + quality (19 tests)
- E2E en deploy pipeline

### ⚠️
- Coverage sin thresholds mínimos en CI
- Sin tests integración Supabase real
- E2E no cubre drawer, filtros complejos, admin

---

## Ops/CI (7.5/10)

### ✅
- Deploy prebuilt Vercel vía Actions
- validate → e2e → deploy → smoke prod
- check-integrations con CRON_SECRET hard fail

### ⚠️
- Branch protection manual (no verificable desde repo)
- Deploy #150 falló por E2E + health 503 (fix 1.0.3)
- `CRON_SECRET` opcional en check local

---

## Checklist post-deploy 1.0.3

```bash
npm run test
npm run test:e2e   # con env Supabase vacío en CI
CRON_SECRET=... npm run check:integrations
npm run verify:prod:1.0
curl -s https://queveohoy.es/api/health | jq '.integrations'  # debe ser null
```

---

## Roadmap hacia 9/10 real

1. **S3** Rotar ADMIN_SECRET
2. **S1** Upstash obligatorio prod
3. **Perf** PartidoPage → server + MatchCardStatic
4. **SEO** OG dinámico hubs
5. **A11y** axe-playwright en CI (gate)
6. **Ops** LHCI sin continue-on-error
7. **Arch** Modularizar cron en jobs independientes
