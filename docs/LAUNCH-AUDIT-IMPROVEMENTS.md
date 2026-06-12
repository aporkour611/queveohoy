# Propuesta de mejoras — maratón lanzamiento

Generado: 2026-06-12 · **v5.0.0** en producción

## Aplicado en v5.0.0

- Preload LCP retratos UFC Casablanca (Topuria/Gaethje)
- Manifest PWA: `display_override`, `scope`, `id`
- Resolver `/partido` con eventos editoriales + curación
- Ficha UFC con hero, metadatos y CTAs «Detalles del combate»
- Maratón lanzamiento 600 ciclos (`npm run marathon:launch`)
- npm audit prod-only en quality scorecard
- verify-prod: ficha UFC + headers seguridad

## Baseline quality (post warm-up)

Ejecutar: `npm run keep-warm:prod && npm run quality:audit`

| Ranking | Meta | Notas |
|---------|------|-------|
| LH A11y / BP / SEO | ≥95 | ✅ 100 |
| LH Performance | ≥95 | 🟡 ~91 — cold start penaliza |
| LCP | ≥95 | 🟡 preload UFC + posters locales |
| CDN/cache | ≥95 | ✅ multi-endpoint probe |
| verify-prod | 100% | ✅ 28/28 tras fix 5.x footer |

## Pendiente post-lanzamiento

- Cron keep-warm cada min en Vercel (obligatorio pre-audit)
- CSP sin `unsafe-inline` (refactor scripts inline)
- PWA installable LH si se prioriza instalación
- E2E Playwright en CI con gate blocking
