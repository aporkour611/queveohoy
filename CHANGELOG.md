# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/).

## [2.60.0] - 2026-06-11

### Added
- FeedFreshness muestra eventos de la semana (`weekCount`)
- Test unitario URLs prefetch semanal
- verify-prod valida `weekCount` en feed-meta

### Changed
- Versión del producto: **2.60.0**
- README móvil documenta enlace a cuenta web

## [2.50.0] - 2026-06-11

### Added
- Hubs SEO: prefetch semanal (`HubWeekWarm` + `<link prefetch>`)
- `GET /api/feed-meta` campo `weekCount`
- Helper `buildWeekViewHomeUrl()` centralizado en `filter-url`
- App móvil: enlace «Gestionar en la web» en Cuenta
- E2E hub `/futbol` y assert `weekCount` en feed-meta

### Changed
- Versión del producto: **2.50.0** · app **1.0.0**
- Hubs muestran meta de agenda global semanal y CTAs a semana/explorar

## [2.40.0] - 2026-06-11

### Added
- ROADMAP maratón 2.13–2.40 (30 ciclos)
- Footer prefetch Explorar y Desarrolladores
- Test prefetch API week pública

### Changed
- Versión del producto: **2.40.0** · app **0.9.0**
- Docs operativas listas para PERF gate bloqueante

## [2.30.0] - 2026-06-11

### Added
- Prefetch doble en Explorar (interno + `/api/v1/feed/week`)
- `readCachedTomorrowFeed` en app móvil
- Docs desarrolladores para feed semanal

### Changed
- TTL prefetch semanal: 60s
- URL `/?week=1` se limpia tras hidratar feed
- Versión del producto: **2.30.0** · app **0.8.0**

## [2.20.0] - 2026-06-11

### Added
- `/explorar` ISR + warm prefetch semanal + contador de eventos
- `GET /api/v1/feed/week` — agenda 7 días en API pública
- Compartir eventos en app (Hoy, Semana, Favoritos)
- Export RGPD con preferencias push
- Prefetch offline de mañana en app
- Deep link `/?week=1` y Explorar → semana completa
- Sync topics push servidor → app móvil

### Changed
- Versión del producto: **2.20.0**
- App móvil: **0.7.0**

## [2.12.0] - 2026-06-11

### Added
- SSR feed semanal en home (vista «Semana completa» sin fetch extra)
- Prefetch `<link>` del API week en documento
- Widget Android «Próximo favorito» (`NextFavorite`) en build EAS

### Changed
- Versión del producto: **2.12.0**
- Mobile `app.json` → `app.config.ts` con plugin widget

## [2.11.0] - 2026-06-11

### Added
- `GET /api/push/subscribe` — preferencias push sincronizadas web ↔ app
- Ajustes push inline en `/cuenta` → Avisos
- App: tema claro / oscuro / sistema en Cuenta
- API `GET /api/v1/widget/next-favorite` + snapshot local para widget nativo

### Changed
- Versión del producto: **2.11.0**

## [2.10.0] - 2026-06-11

### Added
- App: push «solo favoritos», caché offline Semana, login Microsoft
- EAS perfiles `preview-store` / `production-store` con auto-submit
- Tag `mobile-v*` dispara build + submit Play Internal
- Deep link al pulsar notificación push

### Changed
- Versión del producto: **2.10.0**

## [2.9.0] - 2026-06-11

### Added
- Push notifications Expo en app + envío server vía `exp.host`
- API push: `platform: expo` + auth Bearer para móvil
- Caché offline agenda Hoy (15 min) en AsyncStorage
- Login Apple en app + workflow **EAS Build** (manual)

### Changed
- Versión del producto: **2.9.0**

## [2.8.0] - 2026-06-11

### Added
- App móvil: tabs Hoy / Semana / Favoritos / Cuenta
- Auth Supabase en app (Google + magic link) + deep link `queveohoy://auth/callback`
- Favoritos sincronizados con la web (♥ en agenda)
- EAS Build config (`mobile/eas.json`) + CI `mobile.yml`
- Preconnect al origen en home (LCP posters locales)

### Changed
- Versión del producto: **2.8.0**

## [2.7.0] - 2026-06-11

### Added
- Reintentos webhook partners (backoff 3× en 5xx/429)
- Errores OAuth por proveedor en callback y login
- App Expo scaffold en `mobile/` (API v1)
- PSI gate post-deploy (LCP ≤3s warning; `PERF_GATE_BLOCKING` para bloquear)

### Changed
- Versión del producto: **2.7.0**

## [2.6.2] - 2026-06-11

### Fixed
- **Esta semana**: los estrenos de cine editoriales ya no permanecen 21 días tras el estreno (p. ej. *El drama*); solo entran si el estreno cae en la ventana de la semana, igual que las series.

### Changed
- Versión del producto: **2.6.2**

## [2.6.1] - 2026-06-11

### Added
- Rollover automático a las **00:00 Madrid**: `/api/midnight-rollover` + crons Vercel
- Recarga del navegador al cambiar de día (`CalendarDayRefresh`)
- Caché del feed keyed por día de calendario (no arrastra ayer)

### Changed
- Versión del producto: **2.6.1**

## [2.6.0] - 2026-06-11

### Added
- Auditoría Vercel Pro: [VERCEL-PRO-AUDIT.md](./docs/VERCEL-PRO-AUDIT.md)
- Rate limit Edge en `/api/*` (Upstash)
- Preview deploy en PRs (`preview.yml`)
- Consultas por día/slug/búsqueda en BD (partido, API v1)
- Cron partido `?phase=core|extended`

### Changed
- Keep-warm: 5 min (cachés) + 15 min (origen); health ligero sin feed completo
- Cache CDN 1 año en `/posters`, `/deportes`, `/icons`
- Versión del producto: **2.6.0**

## [2.5.0] - 2026-05-31

### Added
- Admin: historial de entregas webhook en pestaña Cron (`GET /api/admin/webhooks/history`)
- Upstash lista `qvh:webhook:history` (40 entradas, 30 días TTL)

### Changed
- Versión del producto: **2.5.0**
- `vercel.json`: `"fluid": true` (Vercel Pro — menos cold start)

## [2.4.0] - 2026-05-31

### Added
- Login: OAuth Apple y Microsoft (`azure`) junto a Google en `/cuenta/login`
- `app/lib/oauth-providers.ts` — proveedores centralizados

### Changed
- Versión del producto: **2.4.0**

## [2.3.0] - 2026-05-31

### Added
- Webhooks partners: `secreto:Etiqueta|https://url` en `PARTNER_API_KEYS`
- Notificación `feed.updated` firmada tras cada cron

### Changed
- Versión del producto: **2.3.0**

## [2.2.0] - 2026-05-31

### Added
- API v2: claves partner (`X-API-Key`), 300 req/min, campos `partner` y `rateLimit` en JSON

### Changed
- Versión del producto: **2.2.0**
- Rate limit unificado en `handlePublicFeedGet` (v1 + v2)

## [2.1.0] - 2026-05-31

### Added
- Admin: dashboard métricas cron (`/api/admin/cron/status`, snapshot Upstash)

### Changed
- Versión del producto: **2.1.0**
- Deploy: PSI LCP como warning (no bloquea publicación)

## [2.0.5] - 2026-05-31

### Changed
- Versión del producto: **2.0.5**
- LCP: WebP local en `/posters`; TMDB **w154**; keep-warm `/api/health?warm=1`

### Verified
- PSI prod: Performance **97**, LCP **1.92s** (`npm run perf:budget` ✅ meta ≤2s)

### Added
- `perf:budget` con `PERF_RETRIES` y gate en workflow **Deploy Production**

## [2.0.4] - 2026-05-31

### Changed
- Versión del producto: **2.0.4**
- LCP: prioriza pósters locales `/posters`; TMDB **w92**; JSON-LD tras el footer

## [2.0.3] - 2026-05-31

### Changed
- Versión del producto: **2.0.3**
- LCP: TMDB **w154** directo; preload sin srcset 640w; calidad preload 58
- Preconnect TMDB antes del script de tema; crestas Champions en lazy
- Un solo `fetchPriority=high` (sin priority en trofeo UCL)

## [2.0.0] - 2026-05-30 — Plataforma estable

### Added
- `docs/ROADMAP-2.0.md`, `npm run verify:prod:2.0`

### Changed
- Versión del producto: **2.0.0** (graduación RC 1.9.9)
- Script verify 1.9 corregido; verify 1.0 acepta 2.x en footer

## [1.9.9] - 2026-05-30 — Release candidate pre-2.0

### Added
- `docs/ROADMAP-1.9.9.md` — plan 1.0.11→1.9.9 por departamento
- `app/lib/filter-css-preload.ts`, `FilterCssIntentBridge`, `feed-etag.ts`
- Tests: `tmdb-client`, `filter-url`, `feed-etag`
- `npm run verify:prod:1.9`

### Changed
- Versión del producto: **1.9.9**
- Feed entretenimiento: pósters TMDB **w185** (`card`) en tarjetas del listado
- LCP preload alineado a 320w; calidad feed 65; `RemotePoster` rootMargin 200px
- `?filtros=` con debounce 280ms; aplicación inmediata al buscar
- `GET /api/home-feed` y `/api/events` con **ETag** y **304**
- `fetchClientJson` deduplica peticiones en vuelo; prefetch semanal TTL 30s
- `/api/feed-meta` cache CDN 60s; idle hidratación 10s
- LHCI: performance ≥80%, LCP warn ≤2s

## [1.0.1] - 2026-05-30

### Added
- CI: CodeQL, Trivy, Snyk (opcional), SonarCloud (opcional), Dependabot, CodeRabbit config
- Lighthouse CI (`lighthouserc.json`, `npm run lhci`)
- Cron modularizado en `app/lib/cron/run-cron.ts`
- Scorecard 10: `docs/SCORECARD-10.md`

### Changed
- Versión del producto: `1.0.1`
- Deploy ejecuta `verify-prod-1.0` post-smoke

## [1.0.0] - 2026-05-30 — Lanzamiento

### Added
- **API v2** — `GET /api/v2/feed` con ETag, 304 Not Modified y scopes documentados
- **Rally WRC** — ingest en cron (TheSportsDB league 4370) y tile activo en filtros
- `RemotePosterStatic` — pósters server-side en `MatchCardStatic`
- `useFocusTrap` en drawer de detalle de evento (accesibilidad v19)
- `useHomeFilterBootstrap` — hidratación de filtros extraída de HomePage (v17)
- `app/dark-mode-feed.css` — tema oscuro completo en feed
- CSS categorías lazy-load al abrir panel de filtros
- `docs/ROADMAP-LANZAMIENTO-1.0.md`, roadmaps v14–v20, `verify:prod:1.0`

### Changed
- Versión del producto: **1.0.0** (lanzamiento oficial; el histórico MVP pasa a `0.1.0`)
- `ThemeProvider` actualiza `theme-color` según tema resuelto
- Páginas de error y 404 con `#main-content`; site layout con `#site-shell`
- Presupuesto Lighthouse: fix lectura `lighthouse-v13-budget.json`
- Micro-interacción `:active` en barras de grupos neon

## [13.0.0] - 2026-05-30

### Added
- `app/components/duel-visuals-static.tsx` — visuales UFC/RG server-only
- `TonightForYouSectionStatic` + `TonightForYouPersonalizer` (idle, solo con plataformas)
- `FeedFreshnessSlot` — frescura del feed diferida
- `app/lib/perf-prefetch.ts` — dedup prefetch semanal
- `app/site-shell.css` — CSS ligero para rutas `(site)`
- `docs/ROADMAP-13.0.md`, `verify:prod:v13`, presupuesto Lighthouse v13

### Changed
- Versión del producto: `13.0.0`
- `ChannelBadge`, `BasketballDuelVisual`, `RolandGarrosDuelVisual` sin `"use client"`
- `MatchCardStatic` usa duel visuals estáticos (menos JS en SSR)
- Critical CSS ampliado; explorar.css solo en rutas que lo necesitan
- Warm cache semanal: `<link prefetch>` + una petición JS como máximo

## [12.0.0] - 2026-05-30

### Added
- `GET /api/health` — estado del servicio, versión y Supabase
- `GET /api/feed-meta` — frescura del feed y conteo de eventos
- Componente `FeedFreshness` en la home
- PWA shortcuts en `manifest.webmanifest` (Hoy, Explorar, Esta noche)
- Widget embed `/embed/categorias` para partners
- Design system neon en `/desarrolladores` (tokens por grupo)
- `docs/ROADMAP-12.0.md`, `docs/ORGANIZACION.md`, `verify:prod:v12`

### Changed
- Versión del producto: `12.0.0`

## [11.0.0] - 2026-05-30

### Added
- Tema claro/oscuro/sistema (`ThemeProvider`, toggle en nav)
- Página `/explorar` con panel grupos neon v10
- Deep link `/?filtros=...` sincronizado con filtros del feed
- API v1.1: parámetro `categories` en `/api/v1/feed`
- E2E: explorar, health, feed-meta, categories filter
- Job Lighthouse opcional en CI (`validate.yml`, workflow_dispatch)
- `docs/ROADMAP-11.0.md`, `verify:prod:v11`

### Changed
- Versión del producto: `11.0.0`
- `/desarrolladores` ampliado con widgets y API health/meta

## [10.0.0] - 2026-05-30

### Added
- Panel **Grupos principales + Subgrupos** neon (mockup aprobado, `CategoryGroupsPanel`)
- `app/lib/filter-groups-design.ts` — tokens visuales y taxonomía v10
- `app/category-groups.css` — barras con watermark, tiles glow SVG
- Documentación `docs/DISENO-REVISION-GRUPOS-v10.md` y `docs/ROADMAP-10.0.md`
- Rallye deshabilitado «Próximamente»; script `verify:prod:v10`

### Changed
- Versión del producto: `10.0.0`
- Filtros detallados reemplazan chips legacy al abrir «Más»
- MotoGP label; TV «Streams y directos»

## [7.0.0] - 2026-05-30

### Added
- Roadmap `docs/ROADMAP-7.0.md` — experiencia premium y meta Performance 100
- `app/lib/premium-images.ts` — LCP unificado, blur placeholder, priority resolver
- Script `npm run posters:compress` (sharp batch en assets locales)
- Script `npm run perf:budget` (Lighthouse mobile con presupuesto LCP/CLS)
- Script `npm run verify:prod:v7`
- API `GET /api/events?scope=week` (ventana 7 días tight, caché separada)
- Prefetch semanal en HTML + idle; shell SSR «Semana completa» interactivo
- Preconnect TheSportsDB + dns-prefetch MAL/TheSportsDB
- View Transitions CSS en cambio de vista del feed; `prefers-reduced-motion`

### Changed
- Versión del producto: `7.0.0`
- SSR home: `omitCovers` en feed estático (protege LCP de destacados)
- Cliente priority: TMDB w342 directo alineado con SSR (`FeaturedEventCard`)
- Calidades imagen: spotlight 62, feed 68, crest 60
- `RemotePoster`: blur-up placeholder + skeleton shimmer pending

### Fixed
- Semana completa: estado `fullWeekReady` ya no se confunde con destacados
- Carrera prefetch/clic en vista semanal (`wantWeekTabsRef`)

## [5.0.0] - 2026-05-30

### Added
- Sección «Para ti esta noche» en home (prime time + plataformas del usuario)
- Filtro global «Solo mis plataformas» en controles del feed
- Asistente «¿Qué veo?»: FAB en home, página `/asistente`, API `POST /api/assistant`
- Integración Vercel AI SDK (`ai`, `@ai-sdk/openai`) con tools y fallback smart sin API key
- Drawer de detalle de evento al interactuar con tarjetas del feed
- Tests unitarios `personalized-tonight` y `assistant-core`
- Script `npm run verify:prod:v5` y `docs/ROADMAP-5.0.md`

### Changed
- Versión del producto: `5.0.0`
- Tarjetas del feed abren drawer en lugar de expandir inline (cuando hay provider)

## [4.0.0] - 2026-05-30

### Added
- Portal de cuenta v2 (`/cuenta`) con navegación lateral: Favoritos, Plataformas, Avisos, Cuenta
- Tabla `user_preferences` y API `PATCH /api/cuenta/preferences` (plataformas, prime time)
- `GET /api/v1/search?q=` con paginación y rate limit compartido con API pública
- Paginación `limit` + `cursor` en `GET /api/v1/feed`
- Export RGPD: `GET /api/cuenta/export` (JSON descargable desde pestaña Cuenta)
- Badge «Tus plataformas» en tarjetas del feed según preferencias guardadas
- Checklist de despliegue `docs/ACCIONES-MANUALES-4.0.md`
- Roadmap estratégico `docs/ROADMAP-4.0.md`
- Script `npm run validate` y `npm run verify:prod:v4`

### Changed
- Búsqueda en agenda: coincidencia por tokens (todas las palabras)
- Final Champions PSG-Arsenal: fallback editorial 30 mayo 18:00 h Madrid
- Hover Champions Week: palpitación solo en el escudo o elemento bajo el cursor
- Versión del producto: `4.0.0`

### Fixed
- Badge «Tus plataformas» ya no aparece en todas las tarjetas sin plataformas configuradas
- Sincronización inmediata de plataformas en la home tras guardar en `/cuenta`

## [2.0.0] - 2026-09-01

### Added
- API pública v1: `GET /api/v1/feed` y `GET /api/v1/events/[id]` con CORS y rate limit
- Widget embed `/embed/esta-noche` («Qué ver esta noche», desde 18:00 h Madrid)
- Página `/desarrolladores` y documentación `docs/API.md`
- Login con Google OAuth en `/cuenta/login`
- Tests E2E con Playwright (`e2e/smoke.spec.ts`, `npm run test:e2e`)
- `app/lib/product-version.ts` como fuente única de versión pública

### Changed
- Headers de seguridad específicos para rutas `/embed/*` (`frame-ancestors *`)
- Gate de hidratación home: 6s desktop / 3s móvil; nav actions 10s
- Versión del producto: `2.0.0`
- Footer con enlace «API y widget» y sitemap `/desarrolladores`

## [1.5.0] - 2026-06-01

### Added
- `app/lib/cron-alerts.ts`: alertas webhook Slack si fútbol = 0 o errores de ingesta
- Admin v2: pestañas Añadir, Listado (filtro fecha/sport, edición) y Cron manual
- `POST /api/admin/cron` para ejecutar ingesta desde el panel
- `PATCH /api/admin/events` para editar title/time/sport/platform/date
- Push «solo favoritos»: columna `favorites_only` + filtro por tabla `favorites`
- Migración `20260601000000_push_favorites_mode.sql`
- Página `/aviso-legal` y enlace en footer
- Variable opcional `CRON_ALERT_WEBHOOK_URL`

### Changed
- Versión del producto: `1.5.0`
- Footer y README actualizados

## [1.4.0] - 2026-07-15

### Added
- Guías SEO ampliadas y optimización LCP móvil
- Tests smoke del cron con mocks

## [1.3.0] - 2026-06-15

### Added
- Auth magic link Supabase (`/cuenta/login`, `/cuenta`)
- Favoritos en tarjetas con tabla `favorites` y RLS

## [1.2.0] - 2026-05-30

### Added
- Contenedores visuales con barra lateral para secciones TV y catálogo en el feed
- 6 guías SEO nuevas (Premier, F1, MotoGP, UFC, NBA, plataformas deportivas)
- Índice `/guia` con listado de todas las guías
- Páginas `/sobre`, `/contacto` y `/novedades`
- Footer ampliado con hubs, guías y enlaces de proyecto
- Admin: listado de eventos recientes y borrado por ID
- Documentación de producto y roadmap Q3 2026

### Changed
- `SeoGuidePage` data-driven desde `seo-guides.ts`
- Sitemap incluye páginas estáticas de confianza y guías
- Versión del producto: `1.2.0`

## [1.1.0] - 2026-03-15

### Added
- Notificaciones Web Push con preferencias por categoría
- PWA: manifest, service worker e iconos de app
- Banner de consentimiento de cookies

## [1.0.0] - 2026-01-20

### Added
- Lanzamiento público: agenda multi-día, filtros, destacados semanales
- 15 hubs SEO, páginas `/partido/[slug]`, JSON-LD, RSS e IndexNow
- Cron unificado (fútbol, motor, UFC, e-sports, TMDB, TV española)

## [0.9.0] - 2025-11-08

### Added
- Parrilla TV (reality, concursos, directos) y catálogo cine/series/anime
- Pipeline de posters editoriales

## [0.7.0] - 2025-09-02

### Added
- Hubs NBA, tenis, ciclismo, Premier, Copa del Rey
- Páginas rolling `/partidos-hoy/[fecha]` (14 días)

## [0.5.0] - 2025-07-10

### Added
- MVP: home deportiva, Supabase, cron football-data.org, deploy Vercel

[2.0.0]: https://github.com/aporkour611/queveohoy/compare/v1.5.0...v2.0.0
[1.5.0]: https://github.com/aporkour611/queveohoy/compare/v1.4.0...v1.5.0
[1.4.0]: https://github.com/aporkour611/queveohoy/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/aporkour611/queveohoy/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/aporkour611/queveohoy/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/aporkour611/queveohoy/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/aporkour611/queveohoy/releases/tag/v1.0.0
