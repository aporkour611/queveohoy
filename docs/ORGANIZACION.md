# Organización — queveohoy.es

Simulación de marca top en tecnología con presupuesto equilibrado entre departamentos.

---

## Departamentos

| Depto | Responsabilidad | Releases recientes |
|-------|-----------------|-------------------|
| **Diseño** | Mockups neon, tokens `--qvh-cat-*`, tema claro/oscuro, accesibilidad | v10 grupos, v11 theme |
| **Producto** | Feed, filtros, `/explorar`, PWA shortcuts, embeds partners | v7 semana, v10 panel, v11 explorar |
| **Backend** | Supabase, cron, API pública v1/v1.1, health/meta | v4 API, v11 categories |
| **Frontend** | Next.js 16, SSR/LCP, hidratación diferida, view transitions | v5–v7 perf |
| **QA** | Vitest, Playwright smoke, verify prod por versión | v4 E2E, v11 explorar |
| **DevOps** | GitHub Actions, Vercel deploy, Lighthouse opcional | v10 CI actions v5 |
| **SRE** | Health checks, feed freshness, alertas cron | v12 health/meta |
| **Legal / RGPD** | Cookies, export cuenta, privacidad | v4 portal |
| **Contenido / SEO** | Hubs, guías, sitemap, IndexNow | v1.4 guías |

---

## Cadencia de release

1. **Roadmap** por versión mayor (`docs/ROADMAP-X.0.md`) con filas por departamento.
2. **Implementación** en `main` con tests en verde.
3. **Deploy** automático vía `.github/workflows/deploy.yml`.
4. **Verificación** con `npm run verify:prod:vX` contra producción.
5. **Novedades** en `/novedades` vía `product-releases.ts`.

---

## Versión actual

Consulta el footer (`PRODUCT_VERSION`) o `GET /api/health`.

Historial: [CHANGELOG.md](../CHANGELOG.md) · [ROADMAP.md](./ROADMAP.md)
