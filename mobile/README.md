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

Escanea el QR **desde la app Expo Go** (no con la cámara del móvil ni Chrome).

## «La conexión no es segura» en el móvil

| Causa | Qué hacer |
|-------|-----------|
| Abriste el QR en **Safari/Chrome** | Eso abre `http://192.168.x.x:8081` (desarrollo). Instala [Expo Go](https://expo.dev/go) y escanea desde ahí |
| Entras a la **web** sin https | Usa siempre **https://queveohoy.es** (con candado) |
| Red local / firewall | `npm run start:tunnel` y escanea el QR de túnel |
| Fecha del móvil incorrecta | Ajusta hora automática en Ajustes |

La web en producción **sí tiene HTTPS** válido. El aviso aparece casi siempre al abrir la URL de desarrollo (`http://…`) en el navegador.

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
