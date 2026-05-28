# Handoff v1.0 — Portadas + fixes finales

## Estado

Portadas editoriales completas, cableadas en Destacados y Feed. Tres bugs de UX corregidos en esta entrega.

---

## 1. Tenis — pelota botando entre banderas

**Requisito:** En partidos de tenis con dos jugadores, la portada muestra las banderas fusionadas y una pelota de tenis animada rebotando entre ellas.

**Implementación:**
- `app/components/RolandGarrosDuelVisual.tsx` — elemento `.qvh-rg-ball` / `.fh-rg-ball`
- `app/roland-garros.css` — animación `qvh-tennis-ball-bounce` (respeta `prefers-reduced-motion`)
- `featured-card.ts` — flag `showTennisDuel` en tenis con `home_team` + `away_team`
- `FeaturedEventCard.tsx` + `MatchCard.tsx` — duelo de tenis en Destacados y Feed

**QA manual:**
1. Abrir un partido RG con dos jugadores → banderas + pelota animada
2. Partido ATP/WTA genérico con dos nombres → mismo comportamiento
3. Activar “Reducir movimiento” en SO → pelota estática, sin animación

---

## 2. Vista “Toda la semana” — cabecera duplicada

**Bug:** Al pulsar “Toda la semana” aparecía dos veces `Hoy jueves, 28 de mayo` + badge `Destacados`.

**Causa:** El encabezado SSR (`HomeFeedDayHeader`) seguía visible mientras el feed cliente pintaba `WeekDaySection` para el mismo día.

**Fix:**
- `HomePage.tsx` — `setSsrTodayShellVisible()` + `useLayoutEffect` oculta el shell SSR al instante en vista semana
- `openWeekView()` — oculta SSR de forma síncrona antes del transition
- `WeekDaySection.tsx` — eliminado badge `Destacados` en vista semana (solo aplica a “Hoy”)

**QA manual:**
1. Cargar home en vista “Hoy” → un solo encabezado con badge Destacados
2. Pulsar “Toda la semana” → desaparece el SSR; solo cabeceras por día sin duplicar hoy
3. Volver a “Hoy” → reaparece el encabezado SSR

---

## 3. Semana de Champions — animaciones

**Bug:** El módulo se veía estático (sin glow, sheen ni pulso).

**Fix en `champions-week.css`:**
- Pulso de borde en `.qvh-cl-week-shell`
- Flotación del trofeo `.qvh-cl-week-trophy`
- Glow más intenso (`scale 1.08`)
- Sheen más rápido (6s vs 9s)
- Todo dentro de `@media (prefers-reduced-motion: no-preference)`

**Nota:** El módulo solo aparece si hay **Final de Champions** en la ventana de 7 días (`resolveChampionsWeekContext` en `champions-week.ts`). Sin ese evento en BD, no se renderiza.

**QA manual:**
1. Con final CL en agenda → hero con brillo, sheen diagonal y trofeo flotando
2. Badge dorado “Final” con glint
3. Con `prefers-reduced-motion: reduce` → sin animaciones

---

## Portadas — regeneración

```bash
npm run posters        # TV (16) + deportes/flagship (16) + esports PNG
npm test
npm run build
npm run verify:release # checklist pre-deploy
```

Assets en:
- `public/deportes/`, `public/ciclismo/`, `public/flagship/`, `public/esports/`, `public/motor/`, `public/posters/`

Lógica de asignación: `app/lib/flagship-covers.ts` + `app/lib/spotlight-art.ts`

---

## Checklist deploy v1.0

- [ ] `npm test` — 104+ tests verdes
- [ ] `npm run build` — sin errores TS
- [ ] `npm run verify:prod` — smoke en producción (post-deploy)
- [ ] Verificar home: Destacados, vista semana, tenis RG, módulo CL (si hay final)
- [ ] Confirmar PNGs servidos (`200` en `/flagship/*`, `/deportes/*`)
- [ ] Deploy a Vercel / entorno prod cuando QA OK

**No desplegar** si falta la final CL en datos y se espera ver el módulo — revisar cron/fútbol primero.
