# Roadmap queveohoy.es

Horizonte simulado a partir del estado **v2.0.0** (septiembre 2026), como si el equipo llevara **18 meses** en producción.

---

## Estado actual — v4.0.0 «Universo Queveo (web)»

| Área | Estado |
|------|--------|
| Feed multi-día + filtros | ✅ Producción |
| 15 hubs SEO + 14 guías | ✅ |
| Cron 11 fuentes + admin v2 + alertas | ✅ |
| Push + PWA + legal completo | ✅ |
| Cuenta v2 / favoritos / plataformas | ✅ v4.0 |
| API pública v1 + búsqueda + paginación | ✅ v4.0 |
| Widget embed | ✅ v2.0 |
| E2E Playwright | ✅ v2.0 |
| Champions Week (final UCL) | ✅ v4.0 |
| LCP móvil | ⚠️ Mejoras continuas |
| App nativa / IA asistente / B2B dashboard | 📋 Ver [ROADMAP-4.0.md](./ROADMAP-4.0.md) |

---

## Mes 16 — Septiembre 2026 · v1.6.0 «Calidad y acceso» ✅

**Objetivo:** confianza operativa y menos fricción en login.

| Entrega | Detalle | Estado |
|---------|---------|--------|
| Google OAuth | Botón en `/cuenta/login` junto a magic link | ✅ |
| E2E Playwright | Smoke: home, API, embed, login | ✅ |
| LCP iteración | Gate desktop 6s, móvil 3s; nav 10s | ✅ |

---

## Mes 17 — Octubre 2026 · v1.7.0 «API pública» ✅

**Objetivo:** abrir datos read-only para medios y partners.

| Entrega | Detalle | Estado |
|---------|---------|--------|
| `GET /api/v1/feed` | JSON estable, CORS, rate limit 60/min | ✅ |
| `GET /api/v1/events/[id]` | Detalle por ID | ✅ |
| `/desarrolladores` + `docs/API.md` | Documentación y ejemplos curl/iframe | ✅ |

---

## Mes 18 — Noviembre 2026 · v1.8.0 «Widget embed» ✅

**Objetivo:** distribución en sitios de terceros.

| Entrega | Detalle | Estado |
|---------|---------|--------|
| `/embed/esta-noche` | Prime time desde 18:00 h (Madrid) | ✅ |
| Headers embed | `frame-ancestors *` sin X-Frame-Options | ✅ |
| Atribución | Enlace visible a queveohoy.es | ✅ |

---

## Release plataforma — v2.0.0 «Plataforma» ✅

Consolidación de v1.6–v1.8 como release mayor:

- API v1 estable con contrato documentado
- Widget embed listo para medios
- Auth social + E2E en CI
- Versión única `PRODUCT_VERSION` en footer y docs

---

## Backlog (post v2.0)

- App nativa (Expo) reutilizando API v1
- Internacionalización (MX/AR) — baja prioridad
- API v2 con filtros avanzados y claves de partner
- OAuth Apple / Microsoft
- Dashboard métricas cron en admin

---

## Simulación completa → v4.0

Cronología paso a paso (equipo 20→40, jun 2026 – jul 2027, presupuesto ilimitado):

→ **[ROADMAP-4.0.md](./ROADMAP-4.0.md)** — sprints 41–68, contrataciones, ADRs, releases v2.1–v4.0.

→ **[ACCIONES-MANUALES-4.0.md](./ACCIONES-MANUALES-4.0.md)** — checklist de tareas que solo puedes hacer tú (Supabase, Vercel, stores, Stripe…).

---

## Criterios de éxito Q4 2026

1. ✅ Integraciones externas vía API o iframe
2. ✅ Smoke E2E en cada PR
3. ⚠️ Core Web Vitals en verde (seguir iterando LCP)
4. ✅ Documentación pública para desarrolladores
