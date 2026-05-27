# queveohoy.es

Agenda deportiva y entretenimiento en España: partidos, horarios TV/streaming, destacados y hubs SEO.

## Stack

- **Next.js 16** (App Router), React 19, TypeScript
- **Tailwind CSS 4**
- **Supabase** (PostgreSQL + RLS)
- **Vercel** (hosting, cron, analytics)
- Deploy vía **GitHub Actions** + Vercel CLI

## Desarrollo local

```bash
cp .env.example .env.local
# Rellena las variables en .env.local

npm ci
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run lint` | ESLint |
| `npm run test` | Tests unitarios (Vitest) |
| `npm run ping-search` | IndexNow manual (requiere `CRON_SECRET`) |
| `npm run vapid:keys` | Genera claves Web Push |

## Variables de entorno

Ver `.env.example`. En producción son obligatorias:

- Supabase (`NEXT_PUBLIC_SUPABASE_*`, `SUPABASE_SERVICE_ROLE_KEY`)
- `ADMIN_SECRET` y `CRON_SECRET` (valores distintos)
- `INDEXNOW_KEY` (con archivo verificador en `/public/`)

## Admin

Acceso en `/admin/login` (POST con `ADMIN_SECRET`; cookie firmada HttpOnly). Panel en `/admin`.

Las escrituras en `events` van por `/api/admin/events` con service role; la tabla tiene RLS de solo lectura para anon.

## Cron

`GET /api/cron` — protegido con `Authorization: Bearer CRON_SECRET`. Vercel Cron lo ejecuta cada hora (ver `vercel.json`).

Ingesta: fútbol, F1, MotoGP, UFC, baloncesto, e-sports, TMDB, etc.

## CI/CD

- **PR → main:** lint + tests (`.github/workflows/validate.yml`)
- **Push → main:** lint + tests + build Vercel + deploy (`.github/workflows/deploy.yml`)

## SEO

Sitemap dinámico, hubs `/agenda/*`, páginas de partido, JSON-LD, RSS, IndexNow tras cron.

## Licencia

Privado — queveohoy.es
