# Que Veo Hoy — PRO Launch 6.0.0

Versión lista para lanzamiento público. Optimizada para cold start en Vercel Hobby con ruta de upgrade a Pro.

## Qué incluye 6.0.0

| Área | Estado |
|------|--------|
| Cold start home | TTFB ~50–130 ms (ISR + keep-warm GHA 15 min APIs, HTML 4×/día) |
| Hidración móvil | 600 ms con SSR (antes 12 s) |
| Portadas | WebP editorial, sin placeholders `/deportes/*.png` en destacados |
| Seguridad | HSTS, CSP, HTTPS redirect, sin mixed content |
| Verify prod | 24/24 checks |
| Quality | 15/20 ≥95% — pendiente LCP/TBT/INP en maratón PRO |

## Scripts de lanzamiento

```bash
npm run exam:pro              # examen profundo 12 dimensiones
npm run marathon:pro-launch   # supermaratón con plan del examen
npm run audit:cold-start:strict
npm run audit:content-visual
```

## Upgrade Vercel Pro (opcional)

Ver `vercel.pro.json` — crons nativos, Fluid compute, regiones. En Hobby: GHA `keep-warm.yml` + `cron-schedule.yml` como respaldo.

## Gates de cierre maratón PRO

1. Cold strict PASS (home ≤500/800 ms)
2. Content/visual 10/10
3. Mobile security 6/6
4. Quality 20/20 cada dimensión ≥95%
5. verify:prod 24/24 con v6.0.0
