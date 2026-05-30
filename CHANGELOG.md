# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/).

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
