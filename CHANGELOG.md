# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/).

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
