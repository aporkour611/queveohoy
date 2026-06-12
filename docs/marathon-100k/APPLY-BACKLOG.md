# Maratón 100k — backlog de aplicación

Generado: 2026-06-12T23:40:21.141Z

## Descubrimiento

- **[P0]** (seo) Añadir JSON-LD en /futbol
- **[P0]** (seo) Añadir JSON-LD en /formula-1
- **[P2]** (monetization) Activar AdSlot con NEXT_PUBLIC_ADS_PREVIEW en staging
- **[P1]** (design) Tarjetas fh-match: sombra, radius 12px, touch targets móvil (ya en CSS local si pendiente deploy)
- **[P1]** (design) Filtros por liga (LaLiga, Champions) además de deporte
- **[P0]** (quality) Subir ranking lh-performance (actual 95%)
- **[P0]** (quality) Subir ranking cwv-lcp (actual 95%)

## Plan de aplicación (fase 2)

- **hub-jsonld-footer** [P1]: Mover HubJsonLd al footer (no competir con LCP)
- **prefetch-deferred** [P1]: HomeWeekPrefetchDeferred en hubs y explorar
- **warm-new-hubs** [P2]: Keep-warm /serie-a /ligue-1 /segunda-division
- **deploy-5-4** [P0]: Bump 5.4.0 + validate + push producción
