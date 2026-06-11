# App móvil QueveoHoy (Expo)

Cliente nativo que consume la [API pública v1](https://queveohoy.es/desarrolladores) de queveohoy.es.

## Requisitos

- Node 22+
- [Expo Go](https://expo.dev/go) en el móvil (desarrollo) o EAS Build (producción)

## Desarrollo

```bash
cd mobile
npm install
npm start
```

Escanea el QR con Expo Go. La agenda carga desde `https://queveohoy.es/api/v1/feed`.

## Variables

| Variable | Default | Descripción |
|----------|---------|-------------|
| `EXPO_PUBLIC_API_BASE` | `https://queveohoy.es` | Base URL de la API |

Copia `.env.example` a `.env` para overrides locales.

## Estructura

- `app/` — Expo Router (pantalla agenda + detalle)
- `lib/api.ts` — cliente tipado de `/api/v1/feed`

## Siguiente

- Favoritos con Supabase auth (misma sesión que web)
- Push notifications (web-push → Expo)
- EAS + stores (ver ROADMAP-2.7)
