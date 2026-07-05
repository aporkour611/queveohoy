# Reactivar queveohoy.es en Vercel

**Estado:** `DEPLOYMENT_DISABLED` — plan Hobby pausado por límite de uso.

## Lo que ya está hecho en código (listo para deploy)

- **6.2.3** — escudos e-sports fijados en `public/crests/` + `pinned-images.json`
- Maratón **bloqueado** mientras exista `docs/marathon-reports/PROD-PAUSED.flag`
- Guards anti-hammering en probes

## Paso que solo Vercel puede hacer (manual, 2 min)

1. [vercel.com/help](https://vercel.com/help) → **Billing / Usage**
2. Asunto: *Request unpause Hobby account — queveohoy*
3. Texto sugerido:

```
Hello Vercel Support,

My Hobby team (alvaro-s-projects20) project "queveohoy" shows 
"This deployment is temporarily paused" / DEPLOYMENT_DISABLED.

I identified the cause: automated load tests from my local machine 
generated excessive edge traffic. I have:
- Stopped all marathon/probe processes
- Added backoff guards so this won't repeat
- Prepared a deploy with pinned static assets to reduce origin transfer

Please manually unpause my account so I can deploy the fix.

Project: queveohoy
Domain: queveohoy.es
Team: alvaro-s-projects20

Thank you.
```

4. Alternativa inmediata: **Upgrade to Pro** en Billing → el deploy se reactiva al instante.

## Cuando te desbloqueen

```bash
# Quitar pausa local
del docs\marathon-reports\PROD-PAUSED.flag

# Verificar
curl -s -o /dev/null -w "%{http_code}" https://queveohoy.es/api/health

# Deploy (GitHub Actions o local)
git push origin main
# o: npx vercel deploy --prod
```
