# Auditoría Vercel Pro — implementado (v2.6.0)

Plan ejecutado tras upgrade a Vercel Pro. Detalle operativo en [OPS-UPTIME.md](./OPS-UPTIME.md).

## Semana 1 — Warm + health + CDN estático

| Cambio | Archivo |
|--------|---------|
| Warm cachés cada **5 min** (`origins=0`) | `vercel.json` |
| Warm completo cada **15 min** | `vercel.json` |
| GHA keep-warm cada **15 min** (full con `KEEP_WARM_FULL=1`) | `keep-warm.yml` |
| Health ligero: COUNT en BD, no feed completo | `health-checks.ts` |
| Cache 1 año posters/deportes/icons | `vercel.json` |
| Fluid + CPU Performance (3009 MB) cron/warm | `vercel.json` |

## Semana 2 — Consultas + Upstash

| Cambio | Archivo |
|--------|---------|
| `fetchEventsForDate`, `fetchEventBySlug`, `searchEventsByAgendaQuery` | `events-feed-server.ts` |
| Partido + OG sin cargar semana entera | `partido/[slug]/*` |
| API v1/v2 feed por día | `public-feed-handler.ts` |
| Búsqueda v1 en BD | `api/v1/search` |
| `fetchEventById` con `unstable_cache` | `events-feed-server.ts` |
| Upstash marcado recomendado en checks | `check-integrations.mjs` |

## Semana 3 — Cron partido

| Cambio | Archivo |
|--------|---------|
| `?phase=core` (fútbol, TMDB, post, webhooks) | `run-cron.ts`, crons 6/12/18h |
| `?phase=extended` (anime, TV, UFC…) | crons :30 |
| `phase=full` manual sigue disponible | `/api/cron` |

## Semana 4 — Edge + previews + móvil

| Cambio | Archivo |
|--------|---------|
| Rate limit Edge + Upstash en `/api/*` | `middleware.ts`, `edge-rate-limit.ts` |
| Preview deploy en PRs | `.github/workflows/preview.yml` |
| Idle 12s en móvil real (PSI sigue en CTA) | `interaction-gate.ts` |

## Manual en dashboard Vercel (tú)

1. **Observability** → activar métricas por ruta.
2. **Upstash** → `UPSTASH_REDIS_REST_URL` + `TOKEN` en Production.
3. Confirmar **Fluid compute** activo (forzado en `vercel.json`).

## Siguiente (backlog)

- Maratón plataforma ✅ v2.40 ([ROADMAP-2.40.md](./ROADMAP-2.40.md))
- PSI gate bloqueante: `PERF_GATE_BLOCKING=1` en GitHub vars cuando LCP estable ≤3s (infra lista desde v2.7)
- Expo 54 + widget iOS
