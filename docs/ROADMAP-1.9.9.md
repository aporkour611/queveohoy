# Roadmap 1.0.10 → 1.9.9

Optimización incremental (imágenes, filtros, carga, arquitectura) hasta **1.9.9** — pre-2.0.

**Cadencia:** un paso = una versión; `validate` entre pasos; deploy opcional cada minor.

| Rango | Tema |
|-------|------|
| 1.0.11–1.0.19 | Imágenes y LCP |
| 1.1.0–1.1.9 | Filtros y deep links |
| 1.2.0–1.2.9 | Hidratación e interaction-gate |
| 1.3.0–1.3.9 | API, caché y prefetch |
| 1.4.0–1.4.9 | CSS diferido y bundles |
| 1.5.0–1.5.9 | HomePage / feed modular |
| 1.6.0–1.6.9 | Cron, ops y observabilidad |
| 1.7.0–1.7.9 | SEO, hubs y embed |
| 1.8.0–1.8.9 | Tests, CI y presupuestos |
| 1.9.0–1.9.9 | Consolidación pre-2.0 |

## 1.0.x — Imágenes

| Ver | Entrega |
|-----|---------|
| 1.0.11 | Feed: `resolveEventPosterUrl(..., "card")` → TMDB w185 |
| 1.0.12 | Preload LCP: srcset mobile-first (320w primero) |
| 1.0.13 | `category-groups.css` prefetch en intent sobre shell SSR |
| 1.0.14 | `RemotePoster` rootMargin 200px (menos trabajo off-screen) |
| 1.0.15 | Calidad feed `IMAGE_QUALITY` 65 + tests poster sizes |
| 1.0.16 | `RemotePosterStatic` alineado con card sizes |
| 1.0.17 | `buildSpotlightPreloadEntry` sin 640w duplicado en móvil |
| 1.0.18 | Preconnect `image.tmdb.org` solo en feed layout |
| 1.0.19 | Scorecard + releases 1.0.11–19 |

## 1.1.x — Filtros

| Ver | Entrega |
|-----|---------|
| 1.1.0 | Debounce escritura `?filtros=` (evita history thrash) |
| 1.1.1 | SSR shell: `data-qvh-filter-intent` en «Más» |
| 1.1.2 | `useHomeFilterBootstrap` sin doble frame en URL |
| 1.1.3 | Quick filters: `startTransition` al aplicar |
| 1.1.4 | Explorar → home sin recargar bundle completo |
| 1.1.5 | `formatFilterSummary` memo en toolbar |
| 1.1.6 | Panel filtros: focus trap al abrir |
| 1.1.7 | Persistencia filtros solo con consent |
| 1.1.8 | E2E deep link `/?filtros=futbol` |
| 1.1.9 | Docs filtros en desarrolladores |

## 1.2.x — Hidratación

| Ver | Entrega |
|-----|---------|
| 1.2.0 | `FeedHydrationBootstrap` sin doble dynamic |
| 1.2.1 | Semana: prefetch solo tras intent (no link head) |
| 1.2.2 | `desktopIdleMs` 10s (menos TBT PSI desktop) |
| 1.2.3 | `DestacadosEnhancer` idle tras primera pintura |
| 1.2.4 | `TonightForYou` solo si plataformas en storage |
| 1.2.5 | Sin `webpackPrefetch` en chunks feed |
| 1.2.6 | `FeedFreshness` requestIdleCallback |
| 1.2.7 | Guía/cuenta: cero `FeedClientRoots` |
| 1.2.8 | Tests `interaction-gate` |
| 1.2.9 | PSI gate documentado en SCORECARD |

## 1.3.x — API

| Ver | Entrega |
|-----|---------|
| 1.3.0 | `home-feed` ETag ligero |
| 1.3.1 | `scope=week` CDN tag separado |
| 1.3.2 | `fetchClientJson` dedup por URL |
| 1.3.3 | `perf-prefetch` TTL 30s |
| 1.3.4 | `/api/feed-meta` cache 60s |
| 1.3.5 | Rate limit events más laxo en home |
| 1.3.6 | Compresión JSON opcional |
| 1.3.7 | Health `perf` hint |
| 1.3.8 | verify script 1.0.11+ |
| 1.3.9 | API.md scopes week/home |

## 1.4.x — CSS

| Ver | Entrega |
|-----|---------|
| 1.4.0 | `feed-sports.css` media=print trick |
| 1.4.1 | `explorar.css` solo explorar |
| 1.4.2 | Critical CSS destacados ampliado |
| 1.4.3 | `site-shell` sin media queries pesadas |
| 1.4.4 | View transitions detrás de `prefers-reduced-motion` |
| 1.4.5 | Dark feed CSS chunk |
| 1.4.6 | Category icons SVG sprite |
| 1.4.7 | Font display swap audit |
| 1.4.8 | LHCI budget LCP 2.0s |
| 1.4.9 | `optimizeCss` doc ops |

## 1.5.x — Arquitectura feed

| Ver | Entrega |
|-----|---------|
| 1.5.0 | Extraer `useHomeFeedData` hook |
| 1.5.1 | Extraer `useHomeWeekLoader` |
| 1.5.2 | `HomePage` < 700 líneas |
| 1.5.3 | Drawer en chunk propio |
| 1.5.4 | `MatchCard` client split |
| 1.5.5 | Cron route solo re-export |
| 1.5.6 | Tipos feed en `feed-types.ts` |
| 1.5.7 | Storybook-less doc components |
| 1.5.8 | Bundle analyzer script |
| 1.5.9 | HomeFeed lazy imports audit |

## 1.6.x — Ops

| Ver | Entrega |
|-----|---------|
| 1.6.0 | Cron split Vercel (ingest vs enrich) |
| 1.6.1 | Alertas cron silenciosas en health |
| 1.6.2 | `check:integrations` ampliado |
| 1.6.3 | Deploy verify 1.9 track |
| 1.6.4 | Dependabot agrupado |
| 1.6.5 | Snyk fail solo critical |
| 1.6.6 | Sonar quality gate |
| 1.6.7 | IndexNow batch limit |
| 1.6.8 | Push cron stagger |
| 1.6.9 | Runbook 1.9 |

## 1.7.x — SEO

| Ver | Entrega |
|-----|---------|
| 1.7.0 | OG image quality w185 |
| 1.7.1 | Hubs JSON-LD batch |
| 1.7.2 | Sitemap priority tune |
| 1.7.3 | Embed lazy CSS |
| 1.7.4 | FAQ schema +2 |
| 1.7.5 | Canonical filtros noindex |
| 1.7.6 | hreflang prep |
| 1.7.7 | RSS cache |
| 1.7.8 | Partidos-hoy ISR |
| 1.7.9 | SEO scorecard 10 |

## 1.8.x — Calidad

| Ver | Entrega |
|-----|---------|
| 1.8.0 | Vitest poster + gate |
| 1.8.1 | E2E PSI smoke (webdriver) |
| 1.8.2 | Coverage 56% gate |
| 1.8.3 | axe home |
| 1.8.4 | perf:budget en CI nightly |
| 1.8.5 | Playwright mobile LCP |
| 1.8.6 | Mock TMDB en tests |
| 1.8.7 | Cron smoke ampliado |
| 1.8.8 | Lint strict hooks |
| 1.8.9 | validate < 3min |

## 1.9.x — Pre-2.0

| Ver | Entrega |
|-----|---------|
| 1.9.0 | SCORECARD global ≥9.5 |
| 1.9.1 | CHANGELOG 1.x completo |
| 1.9.2 | PRODUCT_RELEASES 1.0.11+ |
| 1.9.3 | ROADMAP-2.0 draft |
| 1.9.4 | Deprecations list |
| 1.9.5 | verify:prod:1.9 script |
| 1.9.6 | LHCI perf ≥80% |
| 1.9.7 | Docs ORGANIZACION 1.9 |
| 1.9.8 | Novedades página 1.9 |
| 1.9.9 | **RELEASE CANDIDATE** — tag y checklist 2.0 |

## Estado actual

- **Hecho:** 1.9.9 (RC pre-2.0)
- **Siguiente:** ver [ROADMAP-2.0.md](./ROADMAP-2.0.md) — **2.0.0** en repo; `npm run verify:prod:2.0` tras deploy
