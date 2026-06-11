# Roadmap 2.8.0 — App móvil completa

Extiende [ROADMAP-2.7.md](./ROADMAP-2.7.md).

## Entregado

| Entrega | Detalle |
|---------|---------|
| Tabs | Hoy · Semana · Favoritos · Cuenta |
| Auth móvil | Google OAuth + magic link (Supabase) |
| Favoritos | Misma tabla `favorites` que la web; ♥ en Hoy |
| Semana | 7 días vía `GET /api/v1/feed?date=` |
| EAS | `eas.json` + perfil preview (APK / internal) |
| Deep link | `queveohoy://auth/callback` |

### Supabase (manual)

En **Authentication → URL Configuration** añade:

- `queveohoy://auth/callback`
- `exp://127.0.0.1:8081/--/auth/callback` (Expo Go dev)

Copia en `mobile/.env` las mismas claves anon que Vercel (`EXPO_PUBLIC_SUPABASE_*`).

## Siguiente (2.9+)

- EAS Build en CI + TestFlight / Play Internal
- Push Expo (`expo-notifications`)
- Apple / Microsoft OAuth en app nativa
- Offline cache AsyncStorage del feed
