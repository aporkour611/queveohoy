# Resumen examen profundo PRO — 2026-07-03

Versión objetivo: **6.0.0 PRO** · Base: https://queveohoy.es

## Resultado global: 5/6 dimensiones PASS

| Dimensión | Resultado |
|-----------|-----------|
| Cold start strict | PASS — home 122/131 ms |
| Contenido / portadas | PASS — 10/10 |
| Seguridad móvil | PASS — 6/6 |
| SEO infra | PASS |
| Diseño / UX SSR | PASS |
| Verify prod | PASS — 24/24 |
| Integraciones | PASS |
| **Quality 20/20** | **FAIL — 14/20 ≥95% (media 84%)** |

## Gaps quality (maratón PRO en curso)

| Prioridad | Métrica | Score | Acción |
|-----------|---------|-------|--------|
| P0 | cwv-inp | 0% | defer islands, interaction-gate |
| P0 | cwv-tbt | 0% | code-split HomeFeed, tree-shaking |
| P0 | cwv-lcp | 43% | img directo webp, preload dinámico SSR |
| P1 | lh-performance | 58% | warm pre-audit, lazy feed |
| P2 | cwv-si | 79% | skeleton above-the-fold |
| P2 | e2e-quality | 94% | viewport móvil E2E |

## Implementado en 6.0.0 + maratón

- v6.0.0 PRO (`PRODUCT_VERSION`)
- Eliminado Link preload UFC estático en `vercel.json`
- LCP: `<img>` directo en posters locales WebP (`premium-images.ts`)
- Prefetch semanal diferido a 12 s post-LCP
- Warmup quality sin rutas UFC obsoletas
- `exam:pro` + `marathon:pro-launch` (360 ciclos)
- Quitado preload `/api/feed-meta` del `<head>` (compite con LCP)
- `optimizePackageImports` + `date-fns`
- `vercel.pro.json` plantilla upgrade Pro

## Comandos

```bash
npm run exam:pro
npm run marathon:pro-launch
```

Informe JSON completo (local): `docs/marathon-reports/PRO-DEEP-EXAM-latest.json`
