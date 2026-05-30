# Roadmap 13.0 — Performance engineering

Simulación de **4 años de optimización incremental** condensados en una release de plataforma.

---

## Objetivos Core Web Vitals

| Métrica | Meta v13 | Técnicas |
|---------|----------|----------|
| **LCP** | ≤ 2.0s mobile | SSR estático, preload TMDB directo, cero client en destacados |
| **INP** | ≤ 150ms | Islands: hidratar solo feed + filtros; diferir analytics/freshness |
| **CLS** | ≤ 0.05 | min-height en slots, critical CSS ampliado |
| **TBT** | −40% JS | RSC duel visuals, ChannelBadge, Tonight SSR |

---

## Frontend / Islands

| ID | Entrega | Estado |
|----|---------|--------|
| F13-1 | `duel-visuals-static.tsx` — UFC/RG sin `"use client"` en SSR | ✅ |
| F13-2 | `ChannelBadge`, `BasketballDuelVisual`, `RolandGarrosDuelVisual` → RSC | ✅ |
| F13-3 | `TonightForYouSectionStatic` + personalizer idle (solo si hay plataformas) | ✅ |
| F13-4 | `FeedFreshnessSlot` — montaje tras idle, fetch meta diferido | ✅ |
| F13-5 | Prefetch semanal deduplicado (`perf-prefetch.ts`) | ✅ |

## CSS / entrega

| ID | Entrega | Estado |
|----|---------|--------|
| C13-1 | `site-shell.css` — páginas legales sin `feed-bundle` completo | ✅ |
| C13-2 | `explorar.css` solo en `/explorar` y `/desarrolladores` | ✅ |
| C13-3 | Critical CSS ampliado (tonight, feed shell, freshness) | ✅ |

## Infra / bundler

| ID | Entrega | Estado |
|----|---------|--------|
| I13-1 | `optimizePackageImports` Supabase | ✅ |
| I13-2 | Warm cache semanal: link prefetch + 1× fetch JS | ✅ |
| I13-3 | `perf-budget` v13 (LCP 2.0s, perf ≥ 92) | ✅ |

## QA

| ID | Entrega | Estado |
|----|---------|--------|
| Q13-1 | Test `perf-prefetch` dedup | ✅ |
| Q13-2 | `verify:prod:v13` | ✅ |

---

## Verificación

```bash
npm run validate
npm run perf:budget
npm run verify:prod:v13   # tras deploy
```

## Backlog v13.1+

- `RemotePosterStatic` server para grid feed
- `optimizeCss` en CI nocturno
- PPR / Cache Components Next 16
- Split `category-groups.css` lazy al abrir filtros
