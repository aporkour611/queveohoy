# Revisión de producto — queveohoy.es (mes 15)

**Fecha de revisión:** 1 junio 2026  
**Versión:** 1.5.0  
**Horizonte simulado:** 15 meses desde junio 2025

---

## Resumen ejecutivo

queveohoy.es es una **agenda editorial automatizada** para el mercado español: deportes en directo, TV lineal y catálogo streaming, con horario en península y Baleares. Tras un año y medio simulado de iteración, el producto está **en producción estable**, indexado en buscadores, con cuenta de usuario, favoritos y operaciones mejoradas.

**Fortalezas:** amplitud de fuentes, superficie SEO (15 hubs + guías), UX de feed diferenciada, push con modo favoritos, admin v2, alertas de cron.

**Debilidades:** LCP móvil aún mejorable, E2E ausente, guías sin CMS a largo plazo.

---

## Inventario funcional

### Core (producción)

| Módulo | Cobertura | Notas |
|--------|-----------|-------|
| Home feed | Alta | SSR + hidratación diferida, filtros, búsqueda in-page |
| Destacados | Alta | Carrusel estático + enhancer cliente |
| Deportes | Alta | Fútbol, F1, MotoGP, UFC, NBA, tenis, ciclismo, e-sports |
| TV / entretenimiento | Alta | Reality, concursos, directos, cine, series, anime |
| Hubs SEO | 15 rutas | Vanity URLs en `next.config` |
| Partido detail | Dinámico | JSON-LD, OG por evento |
| Cron | 3×/día + GH Actions + admin manual | ~900 LOC, 11 fetchers, alertas webhook |
| Push | Operativo | Anónimo o solo favoritos con cuenta |
| PWA | Básico | Manifest + SW |
| Legal | Completo básico | Privacidad, cookies, aviso legal, sobre, contacto |
| Cuenta / favoritos | v1.3+ | Auth magic link, tabla favorites, push filtrado v1.5 |
| Admin | v2 | Create, list/filter, edit, delete, cron manual |

### Pendiente (post Q3 2026)

| Módulo | Estado |
|--------|--------|
| E2E | No implementado |
| API pública read-only | Backlog |
| App nativa | Backlog |

---

## Métricas técnicas (referencia)

| Métrica | Valor orientativo |
|---------|-------------------|
| LOC TS/TSX | ~30–35k |
| Componentes React | ~90 |
| CSS custom | ~8.5k líneas |
| Tests unitarios | 44+ archivos |
| Lighthouse SEO | 100 |
| Lighthouse perf móvil | ~35–74 (mejoras v1.4) |

---

## Deuda técnica priorizada

1. **LCP móvil** — seguir alineando preload con elemento LCP real.
2. **Cron monolítico** — smoke tests añadidos v1.4; modularizar más.
3. **E2E** — gap de confianza en flujos críticos (cuenta, push, admin).
4. **Guías data-driven** — falta CMS o MDX a largo plazo.

---

## Conclusión

El producto **supera el MVP editorial**: pipeline de datos, SEO, UX, retención (cuenta/favoritos) y operaciones (admin v2, alertas). El siguiente horizonte es **escala de distribución** (API, widget, app) y **calidad automatizada** (E2E).

Ver plan detallado en [ROADMAP.md](./ROADMAP.md).
