# Roadmap lanzamiento 1.0.0

Simulación del camino **v14 → v20**, renombrado como **1.0.0** — versión oficial de lanzamiento de QueveoHoy.

## Resumen por versión simulada

| Versión | Foco | Entregables clave |
|---------|------|-------------------|
| **v14** | Dark mode feed | `dark-mode-feed.css`, error pages con `#main-content`, `theme-color` dinámico |
| **v15** | Rally WRC | `app/lib/rally.ts`, cron ingest, tile rally activo en filtros |
| **v16** | Imágenes SSR | `RemotePosterStatic`, lazy CSS `category-groups.css` |
| **v17** | Modularidad home | `useHomeFilterBootstrap`, reducción de HomePage |
| **v18** | API partners v2 | `GET /api/v2/feed`, ETag, 304, scopes |
| **v19** | Accesibilidad | `useFocusTrap` en drawer, skip target `#main-content`, E2E a11y |
| **v20 → 1.0** | Consolidación | Versión `1.0.0`, CHANGELOG, verify prod, deploy |

## v14 — Dark mode completo

- CSS del feed adaptado a `html[data-theme="light"]` y dark por defecto
- `ThemeProvider` sincroniza meta `theme-color` (#f8f9fc / #1a1a2e)
- `error.tsx`, `not-found.tsx`, `global-error.tsx` con landmark principal

## v15 — Rally

- TheSportsDB league 4370 (WRC) en cron paralelo
- Filtro `rally` en motor de categorías y panel neon
- Alertas cron: `rallyError` en respuesta JSON

## v16 — Performance imágenes

- Pósters remotos sin `"use client"` en tarjetas estáticas del feed
- CSS de categorías solo al abrir drawer de filtros (menos bytes críticos)

## v17 — HomePage

- Hook `useHomeFilterBootstrap` — URL `?filtros=` + localStorage
- Base para futuros splits (`useHomeWeekLoader`, etc.)

## v18 — API v2

```
GET /api/v2/feed?date=YYYY-MM-DD&limit=50&cursor=...&categories=futbol,tenis
```

- Respuesta: `version: "2"`, `etag`, `scopes`
- Cabeceras: `ETag`, `Cache-Control`, soporte `If-None-Match` → 304

## v19 — A11y

- Focus trap Tab en drawer de evento
- `#main-content` en home, errores y 404
- `#site-shell` en layout `(site)`

## v20 / 1.0.0 — Lanzamiento

- `PRODUCT_VERSION = "1.0.0"`
- Histórico MVP renombrado a `0.1.0` en novedades
- `npm run verify:prod:1.0` post-deploy
- Presupuesto Lighthouse v13 corregido (`perf-budget.mjs`)

## Verificación

```bash
npm run test
npm run build
npm run verify:prod:1.0   # tras deploy a producción
```

## Roadmaps detallados

- [ROADMAP-14.0.md](./ROADMAP-14.0.md)
- [ROADMAP-15.0.md](./ROADMAP-15.0.md)
- [ROADMAP-16.0.md](./ROADMAP-16.0.md)
- [ROADMAP-17.0.md](./ROADMAP-17.0.md)
- [ROADMAP-18.0.md](./ROADMAP-18.0.md)
- [ROADMAP-19.0.md](./ROADMAP-19.0.md)
- [ROADMAP-20.0.md](./ROADMAP-20.0.md)

## Historial previo

v7–v13 documentados en roadmaps anteriores; v13 aporta la base de performance sobre la que se construye el lanzamiento 1.0.
