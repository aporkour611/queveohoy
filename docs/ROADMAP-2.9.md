# Roadmap 2.9.0 — Push Expo, offline y EAS CI

Extiende [ROADMAP-2.8.md](./ROADMAP-2.8.md).

## Entregado

| Entrega | Detalle |
|---------|---------|
| Push Expo | `POST /api/push/subscribe` con `platform: expo` + cron unificado |
| Auth móvil API | Bearer JWT en push subscribe (`resolveRequestUser`) |
| App | Toggle push en Cuenta, Apple OAuth, caché offline 15 min (Hoy) |
| CI | `.github/workflows/eas-build.yml` (manual, `EXPO_TOKEN`) |

### Tokens Expo en BD

Endpoint almacenado como `expo:ExponentPushToken[...]` en `push_subscriptions` (misma tabla que web push).

### Manual

1. GitHub secret **`EXPO_TOKEN`** → Actions → EAS Build
2. `eas init` en `mobile/` (project ID en `app.json`)
3. Supabase redirect: `queveohoy://auth/callback`
4. Opcional: **`EXPO_ACCESS_TOKEN`** en Vercel para mayor cuota push

## Siguiente (2.10+)

- TestFlight / Play Internal automático tras EAS
- Push «solo favoritos» en app
- Cache semana offline
- Microsoft OAuth en app
