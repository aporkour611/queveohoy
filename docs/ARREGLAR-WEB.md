# La web no carga — qué pasa y cómo arreglarlo

## Diagnóstico (comprobado ahora)

| URL | Resultado |
|-----|-----------|
| https://queveohoy.es | **HTTP 402** — `DEPLOYMENT_DISABLED` |
| https://queveohoy.es/api/health | **HTTP 402** |
| `vercel deploy --prod` | **Bloqueado** — *"Team exceeded fair use limits"* |

**No es un bug de tu código.** Vercel ha **pausado tu cuenta Hobby** por uso excesivo (maratón + keep-warm cada 3 min). El último deploy sigue marcado "Ready" en el dashboard, pero el **edge no sirve tráfico**.

**No necesitas pagar Pro** para volver. Necesitas que Vercel **desbloquee el equipo**.

---

## Paso 1 — Ticket a Vercel (5 minutos, gratis)

1. Entra en **[vercel.com/help](https://vercel.com/help)** (logueado como `alvarillo065-4682`).
2. **Contact Support** → Billing / Usage / Account blocked.
3. Copia y pega este mensaje (en inglés, lo entienden mejor):

```
Subject: Request unpause Hobby team — queveohoy.es DEPLOYMENT_DISABLED

Hello,

My Hobby team "alvaro-s-projects20" project "queveohoy" returns HTTP 402 
DEPLOYMENT_DISABLED on queveohoy.es and all *.vercel.app URLs.

Cause: excessive automated traffic from my load tests. I have fixed this:
- Stopped all marathon scripts
- Reduced GitHub keep-warm to APIs every 15 min, HTML 4x/day
- Added PROD_VERCEL_PAUSED in repo to prevent further hammering

Please unpause my Hobby account. I do not want to upgrade to Pro.

Project: queveohoy
Domain: queveohoy.es
Team: alvaro-s-projects20

Thank you.
```

4. Espera respuesta (suele ser **horas o 1–2 días** en Hobby).

---

## Paso 2 — Cuando te desbloqueen

En tu PC, en la carpeta del proyecto:

```powershell
cd c:\Users\alvar\queveohoy

# Comprobar que ya responde 200
npm run prod:status

# Quitar pausa del repo
del docs\PROD_VERCEL_PAUSED

git add -u docs/PROD_VERCEL_PAUSED
git commit -m "chore: reactivar prod tras unpause Vercel"
git push origin main
```

GitHub Actions desplegará la versión **6.2.5** (escudos + Hobby-safe).

---

## Mientras esperas — usar la web en local

```powershell
cd c:\Users\alvar\queveohoy
npm run dev
```

Abre **http://localhost:3000** — misma app, datos de Supabase si tienes `.env.local`.

Comprobar estado en cualquier momento:

```powershell
npm run prod:status
```

---

## Lo que NO arregla nada

- Más `git push` sin unpause → deploy falla igual
- Subir a Pro → desbloquea al instante pero **cuesta dinero** (opcional, no obligatorio)
- Cambiar código → el bloqueo es de **cuenta Vercel**, no del repo

---

Más detalle: [VERCEL-UNPAUSE.md](./VERCEL-UNPAUSE.md) · [HOBBY-FAIR-USE.md](./HOBBY-FAIR-USE.md)
