# Auditoría de rendimiento multi-motor — QueveoHoy

**URL:** https://queveohoy.es  
**Fecha:** 2026-05-30  
**Comando:** `npm run perf:audit` (con `PERF_URL` opcional)

## Motores ejecutados (9)

| # | Motor | Estado | Notas |
|---|--------|--------|-------|
| 1 | **TTFB matrix** (curl) | ✅ | 9 rutas; TTFB real con `time_starttransfer` |
| 2 | **Lighthouse** mobile + desktop | ⚠️ | Mobile 50/100, Desktop 59/100 en prod |
| 3 | **Newman / Postman** | ⚠️ | Colección en `tests/postman/`; timeouts en cold start |
| 4 | **API contract** (fetch) | ✅ | health, v1/v2 feed, search |
| 5 | **Autocannon** (carga HTTP) | ✅ | Home, API v2, health — p99 < 300ms en prod |
| 6 | **PageSpeed Insights API** | ⏭️ | Requiere `PAGESPEED_API_KEY` |
| 7 | **WebPageTest API** | ⏭️ | 403 sin API key |
| 8 | **k6** | ✅ | Script `scripts/k6-load.js`; bin en `.tools/k6/` |
| 9 | **JMeter lite** | ✅ | Plan `.jmx` + fases autocannon si JMeter no instalado |

Reportes JSON/MD en `docs/perf-reports/`.

## Resultados producción (2026-05-30)

### Latencia (TTFB curl, tras warmup)

| Ruta | TTFB | OK |
|------|------|-----|
| `/` | ~44s cold / ~50ms warm | ⚠️ cold start |
| `/explorar` | 262ms | ✅ |
| `/embed/esta-noche` | 191ms | ✅ (antes ~1,7s) |
| `/api/v2/feed` | 158ms | ✅ |
| `/api/health` | 314ms | ✅ |

### Carga (autocannon + k6)

- Home: **157 rps**, p99 **173ms**, 0 errores
- API v2: **105 rps**, p99 **148ms**
- k6: **779 iteraciones**, 15 VUs, sin fallos de umbral

### Lighthouse mobile (prod)

| Métrica | Valor | Meta |
|---------|-------|------|
| Performance | **50** | ≥92 (presupuesto aspiracional) |
| LCP | **3,7s** | ≤2s |
| CLS | **0,015** | ✅ |
| TBT | **~41s** | Inflado por hidratación del feed cliente |

**Cuello de botella:** chunk JS `3794-*.js` (HomeFeed) — ~36s CPU en mobile throttled.

## Correcciones aplicadas en código

1. **`/embed/esta-noche`**: ISR `revalidate=900` + feed ligero (`fetchHomeFeedEvents` en lugar de 7 días).
2. **Home mobile**: hidratación del feed retrasada a ~3,2s idle (antes 450ms) para mejorar LCP/TBT en PSI.
3. **Home**: eliminado prefetch agresivo de `/api/events?scope=week`; import dinámico de FAQ/promo; preconnect innecesario eliminado.
4. **Suite `npm run perf:audit`**: warmup, curl TTFB real, k6, Newman con reintentos, JMeter lite.

## Pendiente / manual

- **Deploy** a producción para aplicar fixes de embed + home.
- **PSI API key** en Vercel: `PAGESPEED_API_KEY` para motor #6.
- **Upstash** en prod: rate limit distribuido bajo carga multi-instancia.
- **Cold start home**: primera petición tras idle puede tardar >30s (regeneración ISR + Supabase); monitorizar en Vercel.
- **Objetivo 92 PSI mobile**: requiere reducir bundle HomeFeed o hidratar solo tras interacción en mobile.

## Cómo re-ejecutar

```bash
# Producción
PERF_URL=https://queveohoy.es npm run perf:audit

# Local (build + start)
npm run build && npm start
PERF_URL=http://127.0.0.1:3000 npm run perf:audit

# k6 solo
K6_BIN=.tools/k6/k6-v0.57.0-windows-amd64/k6.exe k6 run -e BASE=https://queveohoy.es scripts/k6-load.js
```
