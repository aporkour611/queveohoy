# Roadmap 2.20.0 — Explorar, API week y app polish

Extiende [ROADMAP-2.12.md](./ROADMAP-2.12.md).

## Entregado (ciclos 2.13–2.20)

| # | Entrega |
|---|---------|
| 1 | `/explorar` ISR + prefetch semanal + contador eventos |
| 2 | `GET /api/v1/feed/week` (API pública 7 días) |
| 3 | App móvil usa `/api/v1/feed/week` con fallback |
| 4 | Compartir evento (↗) en Hoy, Semana y Favoritos |
| 5 | Export RGPD incluye `pushPreferences` |
| 6 | Prefetch offline de mañana tras cargar Hoy |
| 7 | `/?week=1` abre vista semanal al hidratar |
| 8 | Explorar sin filtros → `/?week=1` |
| 9 | Sync push topics desde servidor en app |
| 10 | Widget hint Android + versión app en Cuenta |

## Siguiente (2.21+)

- Expo 54 + widget iOS
- `PERF_GATE_BLOCKING=1` en GitHub vars
- Prefetch categorías en hubs SEO
