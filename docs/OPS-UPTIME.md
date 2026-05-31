# Disponibilidad — cold start Vercel + Supabase

## No depende de Cursor

Abrir o cerrar **Cursor** no afecta a producción (`queveohoy.es`). Vercel y Supabase siguen en la nube.

Si la web “no carga” tras **varias horas sin visitas**, suele ser:

1. **Cold start** de la función serverless en Vercel (primera petición lenta).
2. **Regeneración ISR** de la home (`revalidate = 900`) + consultas a Supabase.
3. En plan gratuito de Supabase, el proyecto puede **pausarse tras ~7 días** sin actividad (hay que reactivarlo en el dashboard).

Medición interna (2026-05-30): home **~49s** en frío, **~50ms** en caliente.

## Qué hace el proyecto

| Mecanismo | Frecuencia |
|-----------|------------|
| Cron Vercel `GET /api/warm` | Cada **10 min** |
| GitHub Actions `keep-warm.yml` | Cada **15 min** (`/api/warm` + `GET /`) |
| Timeouts Supabase HTTP | 6s (feed), 4–8s (health) |
| Home `loadHomePageData` | `cache()` — una carga por petición (metadata + page) |

## Comprobar

```bash
curl -sS https://queveohoy.es/api/warm
curl -sS https://queveohoy.es/api/health
```

Si `warm` devuelve `503` con errores de base de datos, revisa Supabase (proyecto pausado o variables en Vercel).

## Supabase pausado

Dashboard → proyecto → **Restore**. No se despierta solo en segundos; la primera petición puede tardar más hasta que el keep-warm vuelva a calentar la caché.
