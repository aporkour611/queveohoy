# Reactivar queveohoy.es en Vercel (Hobby — sin Pro)

**Estado:** `DEPLOYMENT_DISABLED` — plan **Hobby** pausado por límite de uso (*fair use*).

**No necesitas Pro.** El sitio está diseñado para Hobby; el bloqueo fue por tráfico automatizado excesivo (maratón + keep-warm cada 3 min con HTML). Ver [HOBBY-FAIR-USE.md](./HOBBY-FAIR-USE.md).

## Lo que ya está hecho en código

- **6.2.4** — keep-warm Hobby-safe (APIs 15 min, HTML 4×/día)
- **6.2.3** — escudos e-sports en `public/crests/`
- `docs/PROD_VERCEL_PAUSED` — GHA no martilla prod mientras pausado
- Maratón bloqueado; backoff 24 h si `DEPLOYMENT_DISABLED`

## Pedir unpause (gratis, Hobby)

1. [vercel.com/help](https://vercel.com/help) → **Billing / Usage**
2. Asunto: *Request unpause Hobby account — queveohoy*
3. Texto sugerido:

```
Hello Vercel Support,

My Hobby team (alvaro-s-projects20) project "queveohoy" shows 
"This deployment is temporarily paused" / DEPLOYMENT_DISABLED.

Cause: excessive automated traffic from local load tests and 
GitHub Actions keep-warm every 3 minutes with full HTML warm.

I have fixed this in code (v6.2.4):
- Stopped all marathon/probe processes against production
- Keep-warm reduced to APIs every 15 min + HTML 4x/day only
- PROD_VERCEL_PAUSED flag blocks GHA until I manually re-enable
- Pinned static crests to reduce bandwidth

Please unpause my Hobby account. I am NOT upgrading to Pro.

Project: queveohoy
Domain: queveohoy.es
Team: alvaro-s-projects20

Thank you.
```

## Cuando te desbloqueen

```bash
del docs\PROD_VERCEL_PAUSED
del docs\marathon-reports\PROD-PAUSED.flag

git add -u docs/PROD_VERCEL_PAUSED
git commit -m "chore: reactivar prod tras unpause Vercel Hobby"
git push origin main

curl -s -o /dev/null -w "%{http_code}" https://queveohoy.es/api/health
```

El deploy en GitHub Actions aplicará 6.2.3+6.2.4 automáticamente.

## Mientras prod está pausado

- GHA: validate/tests sí; keep-warm, cron, deploy **no**
- Maratón local bloqueado
- Desarrollo local (`npm run dev`) sin cambios
