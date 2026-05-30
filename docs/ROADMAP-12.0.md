# Roadmap 12.0 — Observabilidad y ecosistema

Cierre del ciclo v7→v12: operaciones, partners y design system documentado.

---

## Plataforma / SRE

| ID | Entrega | Owner | Estado |
|----|---------|-------|--------|
| S12-1 | `GET /api/health` — versión, Supabase, timestamp | SRE | ✅ |
| S12-2 | `GET /api/feed-meta` — frescura y conteo de eventos | SRE | ✅ |
| S12-3 | Componente `FeedFreshness` en home | SRE | ✅ |

## Producto / Partners

| ID | Entrega | Owner | Estado |
|----|---------|-------|--------|
| P12-1 | PWA shortcuts (Hoy, Explorar, Esta noche) | Producto | ✅ |
| P12-2 | Widget embed `/embed/categorias` | Producto | ✅ |
| P12-3 | Design system neon documentado en `/desarrolladores` | Producto | ✅ |

## Documentación / Org

| ID | Entrega | Owner | Estado |
|----|---------|-------|--------|
| O12-1 | `docs/ORGANIZACION.md` — departamentos simulados | PM | ✅ |
| O12-2 | `npm run verify:prod:v12` | DevOps | ✅ |

## Verificación

```bash
npm run validate
npm run verify:prod:v12   # tras deploy
```

Ver también: [ROADMAP-11.0.md](./ROADMAP-11.0.md) · [ORGANIZACION.md](./ORGANIZACION.md)
