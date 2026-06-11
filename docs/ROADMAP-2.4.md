# Roadmap 2.4.0 — OAuth Apple y Microsoft

Extiende [ROADMAP-2.3.md](./ROADMAP-2.3.md) (webhooks partners).

## Entregado

| Entrega | Detalle |
|---------|---------|
| Login social | Botones Apple y Microsoft junto a Google en `/cuenta/login` |
| Proveedores | `google`, `apple`, `azure` vía Supabase `signInWithOAuth` |
| Config | Activar proveedores en Supabase Dashboard + redirect `https://queveohoy.es/auth/callback` |

## Configuración Supabase (producción)

1. **Authentication → Providers**: habilitar Apple y Azure (Microsoft).
2. **URL Configuration**: Site URL y redirect URLs deben incluir `https://queveohoy.es/auth/callback`.
3. Apple: Service ID, clave `.p8`, Team ID y Bundle ID según [docs Supabase Apple](https://supabase.com/docs/guides/auth/social-login/auth-apple).
4. Azure: Application (client) ID y secret del registro en Entra ID; redirect URI del proveedor.

Sin activar el proveedor en Supabase, el botón redirige y Supabase devuelve error de configuración.

## Siguiente (2.5+)

Ver [ROADMAP-2.5.md](./ROADMAP-2.5.md) (historial webhooks admin).

- App Expo (API v1/v2)
- OAuth: mensajes de error por proveedor en callback (`?error=`)
