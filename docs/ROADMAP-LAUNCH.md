# Maratón 9 — Pulido pre-lanzamiento

**Ciclos 241–270** · tema `launch-polish`

## Objetivos

1. **Rutas rotas** — `/partido/[slug]` resuelve eventos editoriales (UFC Casablanca, final Champions).
2. **Main event** — CTA «Detalles del combate» → ficha con hero UFC, cartel y metadatos.
3. **Tarjetas** — Destacados interactivos enlazan a ficha; pósters locales/TMDB correctos.
4. **Botones** — CTAs consistentes (`fh-btn-primary`) en ficha y 404.
5. **Verify** — `npm run verify:prod` incluye HTTP 200 en ficha Topuria–Gaethje.

## Comandos

```bash
npm test
npm run validate
npm run verify:prod
npm run marathon:run -- --marathon=9   # cuando esté cableado
```

## Siguiente

Maratón 10+: sostener quality ≥95% post warm-up en producción.
