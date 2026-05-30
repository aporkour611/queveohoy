# Roadmap 11.0 — Experiencia y plataforma

Entrega equilibrada entre **Diseño**, **Producto**, **Backend/API**, **QA** y **DevOps**.

---

## Diseño / UX

| ID | Entrega | Owner | Estado |
|----|---------|-------|--------|
| D11-1 | Tema system / light / dark con toggle en nav | Diseño | ✅ |
| D11-2 | Tokens CSS `data-theme` sin romper look legacy oscuro | Diseño | ✅ |
| D11-3 | Página `/explorar` full-width con panel neon v10 | Diseño | ✅ |

## Producto

| ID | Entrega | Owner | Estado |
|----|---------|-------|--------|
| P11-1 | Deep link `/?filtros=futbol,tenis` sincronizado con agenda | Producto | ✅ |
| P11-2 | Nav «Explorar» desde home | Producto | ✅ |
| P11-3 | CTA «Ver en la agenda» desde explorador | Producto | ✅ |

## Backend / API

| ID | Entrega | Owner | Estado |
|----|---------|-------|--------|
| B11-1 | `GET /api/v1/feed?categories=futbol,tenis` (extensión v1.1) | Backend | ✅ |
| B11-2 | Campo `apiMinorVersion` + `categoriesApplied` en respuesta | Backend | ✅ |

## QA

| ID | Entrega | Owner | Estado |
|----|---------|-------|--------|
| Q11-1 | Tests unitarios `filter-url` + API categories | QA | ✅ |
| Q11-2 | E2E explorar + filtros URL | QA | ✅ |

## DevOps

| ID | Entrega | Owner | Estado |
|----|---------|-------|--------|
| O11-1 | Job Lighthouse opcional en CI (`continue-on-error`) | DevOps | ✅ |
| O11-2 | `npm run verify:prod:v11` | DevOps | ✅ |

## Verificación

```bash
npm run validate
npm run verify:prod:v11   # tras deploy
```

Ver también: [ROADMAP-10.0.md](./ROADMAP-10.0.md) · [ROADMAP-12.0.md](./ROADMAP-12.0.md)
