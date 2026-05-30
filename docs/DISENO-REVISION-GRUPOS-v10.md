# Revisión de diseño — Grupos y subgrupos v10

**Fecha:** 2026-05-30 · **Mockup:** `assets/…/image-ff227275…png`  
**Participantes:** Producto, Diseño UX, Frontend, Datos (cron/API)

---

## Aprobado ✅

| Decisión | Detalle |
|----------|---------|
| Jerarquía 5+1 | 5 barras principales + subgrupos en tiles cuadrados neon |
| Estilo visual | Fondo `#0B0B0F`, glow por categoría, watermark semitransparente |
| Iconografía | SVG inline (CategoryIcon) + `filter: drop-shadow` — **sin PNG** |
| Interacción | Barra = seleccionar todo el grupo; tile = toggle subcategoría |
| Accesibilidad | `aria-pressed`, contraste WCAG AA en labels, `prefers-reduced-motion` sin glow animado |
| Toolbar compacto | Quick filters horizontales se mantienen; panel «Más» abre diseño completo |

## Ajustes acordados (mockup → producción)

| Mockup | Decisión equipo | Motivo |
|--------|-----------------|--------|
| Cine: subtítulo incluye REALITY/CONCURSOS | **Eliminado** del bloque cine | Duplicado con TV; cine = cine, series, anime |
| Motor: F1 · MOTOGP · MOTOS · RALLYE | F1 + MotoGP (`motos`) + Rally **próximamente** | BD usa `formula1` y `motos`; rally sin ingest aún |
| TV: STREAMS + DIRECTOS | Un filtro `tv-directo` con tiles **Streams** y **Directos** | Misma taxonomía; UX distingue labels |
| Motos: 1 tile «Motos» | Label **MotoGP** en tile (helmet) | Alineado con hub SEO motogp |
| LoL tile | Label **League of Legends** en panel; chip sigue «LoL» | Legibilidad premium |
| Watermarks SPORT/MOTOR/… | Tipografía display  uppercase, opacity 0.07 | No compite con LCP |

## Paleta neon (tokens CSS)

| Grupo | Accent | Glow |
|-------|--------|------|
| Deportes | `#3aab6e` | `#3aab6e55` |
| Motor | `#f97316` | `#f9731655` |
| E-Sports | `#a855f7` | `#a855f755` |
| TV y Twitch | `#d946ef` | `#d946ef55` |
| Cine, series y anime | `#c9a227` | `#c9a22755` |

## Rendimiento (criterio Google-scale)

- Panel de grupos solo montado cuando filtros abiertos (`hidden` → no layout)
- SVG < 2 KB por icono; sin imágenes raster en filtros
- CSS `content-visibility: auto` en secciones de subgrupos
- Sin `backdrop-filter` en tiles (solo drop-shadow)

## Sign-off

| Rol | Estado |
|-----|--------|
| Diseño UX | ✅ Aprobado con ajustes tabla |
| Frontend | ✅ Implementable con FILTER_GROUPS existente |
| Datos | ✅ Rally deshabilitado hasta cron rally |
| Producto | ✅ Ship en v10.0.0 |
