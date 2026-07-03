# PRO 6.1.0 — 100 tests (agenda TV)

Batería específica para webs tipo **queveohoy**: agenda deportiva, TV, destacados con posters, APIs feed, hubs SEO, cold start ISR.

## Ejecutar

```bash
npm run test:pro-100          # 100 checks en prod + unit tests
npm run marathon:ultra-pro    # loop hasta 100/100 PASS
```

## Categorías (100 tests)

| Cat | # | Qué mide |
|-----|---|----------|
| cold | 10 | TTFB home, APIs feed, hub /explorar, ISR |
| api | 15 | feed-meta, home-feed, health, ETag, cache |
| security | 10 | HSTS, CSP, mixed content |
| seo | 10 | canonical, JSON-LD, OG, RSS |
| visual | 15 | destacados SSR, posters, espaciado, LCP preload |
| routes | 10 | explorar, legal, manifest, sitemap |
| quality | 10 | rankings LH/CWV ≥95% (último scorecard) |
| unit | 10 | Vitest suite + regresión |

## Gate cierre PRO definitivo

**100/100 tests PASS** + maratón `ultra-pro-61` COMPLETED.

## v6.1.0 cambios clave

- Sin posters genéricos `/deportes/*.png` en tarjetas (solo escudos o editorial)
- CalendarDayRefresh diferido 12s (menor TBT)
- LCP local WebP en `buildLcpPosterUrl`
- Espaciado destacados ajustado (menos hueco)
- `marathon:ultra-pro` hasta perfección
