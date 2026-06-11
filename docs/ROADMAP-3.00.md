# Roadmap 3.00.0 — Cierre maratón 2.71–3.00

Extiende [ROADMAP-2.90.md](./ROADMAP-2.90.md).

Maratón **2.71 → 3.00** (30 ciclos, tercer sprint continuo).

## Entregado (ciclos 2.91–3.00)

| # | Entrega |
|---|---------|
| 81 | Guía `DEPLOY-PERF-GATE.md` |
| 82 | Plan widget iOS (`mobile/docs/IOS-WIDGET.md`) |
| 83 | Plataforma **3.00.0** · app **1.1.0** |
| 84 | 293 tests unitarios OK |
| 85 | Maratón 2.71–3.00 documentado |
| 86 | feed-meta payload testable (2.80) |
| 87 | Sitemap + widget E2E (2.90) |
| 88 | Keep-warm hubs + API week |
| 89 | Backlog Expo 54 priorizado con pasos |
| 90 | Cierre sprint — tres maratones completos |

## Resumen maratón 2.71–3.00

- **Web:** `buildFeedMetaPayload`, `HubWeekCtaLink`, `todayCount` en frescura y verify-prod
- **Ops:** keep-warm ampliado, sitemap tests, guía PERF gate
- **App:** WidgetHint iOS, login → web, docs widget iOS

## Resumen global (tres maratones)

| Maratón | Rango | Versión final |
|---------|-------|---------------|
| 1 | 2.13 → 2.40 | 2.40.0 |
| 2 | 2.41 → 2.70 | 2.70.0 |
| 3 | 2.71 → 3.00 | **3.00.0** |

## Siguiente (3.01+)

- Expo 54 + widget iOS (ver `mobile/docs/IOS-WIDGET.md`)
- Activar `PERF_GATE_BLOCKING=1` (ver `docs/DEPLOY-PERF-GATE.md`)
- EAS TestFlight + credenciales widget
