# App móvil QueveoHoy (Expo)

Cliente nativo con **agenda**, **semana**, **favoritos** y **cuenta** — misma API y Supabase que la web.

## Requisitos

- Node 22+
- [Expo Go](https://expo.dev/go) (desarrollo) o [EAS Build](https://docs.expo.dev/build/introduction/) (APK/TestFlight)

## Configuración

```bash
cd mobile
cp .env.example .env
# Rellena EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY (mismas que Vercel)
npm install
npm start
```

Escanea el QR **desde Expo Go** (no desde Safari/Chrome).

En **Supabase → Authentication → Redirect URLs** añade:

- `queveohoy://auth/callback`
- `exp://127.0.0.1:8081/--/auth/callback` (solo desarrollo Expo Go)

## Pestañas

| Tab | Qué hace |
|-----|----------|
| **Hoy** | `GET /api/v1/feed` + ♥ favoritos (con sesión) |
| **Semana** | 7 días de agenda |
| **Favoritos** | Tabla `favorites` de Supabase |
| **Cuenta** | Google, Apple o magic link + toggle push |

## Offline

La pestaña **Hoy** guarda la última agenda en el móvil (15 min) por si falla la red.

## Push nativo

En **Cuenta → Avisos de eventos** (requiere build EAS, no simulador). El servidor usa la misma cola que web push (~45 min antes del evento).

## Build nativo (EAS)

```bash
npm i -g eas-cli
eas login
eas init   # una vez, vincula proyecto Expo
npm run eas:preview
```

Perfiles en `eas.json`: `development`, `preview` (APK/internal), `production`.

## «La conexión no es segura»

| Causa | Qué hacer |
|-------|-----------|
| QR abierto en **Safari/Chrome** | Usa **Expo Go** para escanear |
| URL `http://192.168…` | Normal en dev; no uses el navegador |
| Web en móvil | Solo **https://queveohoy.es** |

## Variables

| Variable | Default |
|----------|---------|
| `EXPO_PUBLIC_API_BASE` | `https://queveohoy.es` |
| `EXPO_PUBLIC_SUPABASE_URL` | (requerido para login/favoritos) |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | (requerido para login/favoritos) |

## Red local

```bash
npm run start:tunnel
```
