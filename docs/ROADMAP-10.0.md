# Roadmap 8.0 → 10.0 — Design system premium

Salto de versión consolidado (recursos ilimitados, entregas en cadena).

---

## v8.0 — Design tokens & motion

| ID | Entrega | Estado |
|----|---------|--------|
| D1 | Tokens CSS `--qvh-cat-*` por grupo | ✅ v10 |
| D6 | View Transitions feed (heredado v7) | ✅ v7 |
| D7 | Dark mode sistema | 📋 v10.1 |
| D8 | Tipografía display en watermarks | ✅ v10 |

## v9.0 — Categorías inteligentes

| ID | Entrega | Estado |
|----|---------|--------|
| C1 | Taxonomía TV streams/directos unificada | ✅ v10 |
| C2 | Filtros persistentes + consentimiento | ✅ existente |
| C3 | Rally placeholder «Próximamente» | ✅ v10 |
| C4 | Hub labels MotoGP vs Motos | ✅ v10 |

## v10.0 — Grupos neon (mockup aprobado)

| ID | Entrega | Estado |
|----|---------|--------|
| G1 | Barras GRUPOS PRINCIPALES | ✅ |
| G2 | Tiles SUBGRUPOS con glow SVG | ✅ |
| G3 | Revisión diseño documentada | ✅ `DISENO-REVISION-GRUPOS-v10.md` |
| G4 | Herencia v7 perf + imágenes premium | ✅ |
| G5 | `verify:prod:v10` | ✅ |

## v10.1+ (backlog)

- Dark mode completo con tokens neon
- Rallye WRC en cron + tile activo
- Tile MotoGP separado de motociclismo general
- `/explorar` página dedicada con grid full-screen del mockup
- Animación micro-interacción en barras (scale 1.02, intensify glow)

## Verificación

```bash
npm run validate
npm run verify:prod:v10
```

Ver también: [ROADMAP-7.0.md](./ROADMAP-7.0.md), [DISENO-REVISION-GRUPOS-v10.md](./DISENO-REVISION-GRUPOS-v10.md)
