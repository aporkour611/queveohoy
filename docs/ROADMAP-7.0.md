# Roadmap 7.0 — Experiencia premium · Core Web Vitals 100

Versión objetivo: **7.0.0** · Horizonte: empresa a escala Google · recursos ilimitados

> v6 (dark mode, design system) se absorbe en v7.x; v7.0 se centra en **cero bugs percibidos**, **rendimiento medible** e **imágenes de clase mundial**.

---

## Objetivo de producto

| Métrica | Meta v7.0 | Herramienta |
|---------|-----------|-------------|
| Performance (mobile) | **100** | Lighthouse / PSI |
| LCP | **≤ 2.0 s** | CrUX / lab |
| CLS | **≤ 0.05** | CrUX / lab |
| INP | **≤ 150 ms** | CrUX |
| Semana completa | 1 clic, < 800 ms TTFB caché | RUM + verify:v7 |

---

## Fase 1 — Rendimiento núcleo ✅ (v7.0.0)

| ID | Entrega | Estado |
|----|---------|--------|
| P1 | Feed semanal: 1 clic, prefetch, API `scope=week` ajustada | ✅ v6.1 implícito |
| P2 | SSR home **sin pósters** bajo destacados (`omitCovers`) | ✅ v7.0 |
| P3 | LCP unificado: TMDB w342 directo SSR + cliente priority | ✅ v7.0 |
| P4 | Preconnect/dns-prefetch a CDNs de posters | ✅ v7.0 |
| P5 | `content-visibility` + `contain-intrinsic-size` en secciones feed | ✅ v7.0 |
| P6 | Calidad adaptativa: spotlight 62, feed 68, crest 60 | ✅ v7.0 |
| P7 | Script `npm run posters:compress` (sharp batch) | ✅ v7.0 |
| P8 | `npm run verify:prod:v7` + checklist release | ✅ v7.0 |

## Fase 2 — Imágenes «trucos ocultos» ✅ (v7.0.0)

| ID | Entrega | Detalle |
|----|---------|---------|
| I1 | TMDB bypass | Preload + `<img>` directo w342 (sin `/_next/image` en LCP) |
| I2 | Next Image AVIF/WebP | `formats: [avif, webp]`, qualities tunadas |
| I3 | Lazy IO 240px | `RemotePoster` + `WeekDaySection` eager solo ±1 día |
| I4 | Blur-up local | Placeholder dominante en pósters `/public/*` |
| I5 | Compresión batch | PNG → mozjpeg/png quantize en CI opcional |
| I6 | `sizes` precisos | Spotlight 72vw móvil, card 45vw |

## Fase 3 — UX premium (v7.0.0 + v7.1)

| ID | Entrega | Estado |
|----|---------|--------|
| U1 | View Transitions API en cambio Hoy ↔ Semana | ✅ v7.0 CSS |
| U2 | `prefers-reduced-motion`: loader y transiciones | ✅ v7.0 |
| U3 | Skeleton blur en posters lazy (shimmer) | ✅ v7.0 |
| U4 | Dark mode sistema (heredado v6) | 📋 v7.1 |
| U5 | Motion library unificada | 📋 v7.1 |
| U6 | Feed móvil rediseñado | 📋 v7.2 |

## Fase 4 — Observabilidad (v7.0.0)

| ID | Entrega | Estado |
|----|---------|--------|
| O1 | `@vercel/speed-insights` (ya activo) | ✅ |
| O2 | Script `npm run perf:budget` (Lighthouse local) | ✅ v7.0 |
| O3 | Gate CI opcional LCP ≤ 2.5 s en validate | 📋 opt-in |
| O4 | Dashboard CrUX en docs | 📋 manual |

## Fase 5 — Calidad cero bugs

| ID | Entrega | Estado |
|----|---------|--------|
| Q1 | 197+ tests unitarios + E2E Playwright | ✅ |
| Q2 | Auth Supabase runtime inject (SSR env) | ✅ |
| Q3 | GitHub Actions Node 24 | ✅ |
| Q4 | Regresión semana completa en verify:v7 | ✅ v7.0 |

---

## Arquitectura v7

```
Home SSR
├── DestacadosStaticRow (LCP poster, 1× priority)
├── HomeFeedDayStatic (omitCovers — texto + escudos, sin posters)
├── HomeLcpPreload (TMDB direct | /_next/image srcset)
└── HomeFeedGate → HomeFeed (hidratación diferida, prefetch week)

Imágenes
├── lcp-poster.ts      → TMDB w342 bypass
├── optimized-image.ts → qualities, sizes, preload helpers
├── premium-images.ts  → blur placeholder, priority src resolver
├── RemotePoster.tsx   → IO lazy + AVIF/WebP
└── scripts/compress-posters.mjs → sharp batch
```

---

## Verificación

```bash
npm run validate
npm run posters:compress    # opcional, antes de release
npm run perf:budget         # Lighthouse mobile home
npm run verify:prod:v7      # tras deploy producción
```

## Variables / manual

- Sin nuevas env obligatorias.
- Tras deploy: ejecutar `verify:prod:v7`.
- Opcional CI: `PERF_BUDGET=true` en validate para gate Lighthouse.

## Próximo (v7.1+)

- Dark mode + design tokens v2
- AVIF estático en `/public/posters/*.avif` servido con `<picture>`
- Edge cache `/api/events?scope=week` en CDN Vercel
- App nativa Expo reutilizando API v1
