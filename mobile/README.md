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
| **Hoy** | `GET /api/v1/feed` + ♥ favoritos + compartir ↗ |
| **Semana** | `GET /api/v1/feed/week` (fallback por día) + offline 15 min |
| **Favoritos** | Tabla `favorites` de Supabase |
| **Cuenta** | Google, Apple o magic link + toggle push |

## Widget Android (EAS)

Tras build nativo, añade el widget **Próximo favorito** desde el launcher. Se actualiza cuando cambias favoritos en la app.

Requiere EAS (`npm run eas:preview`); no funciona en Expo Go.

## Offline

**Hoy** y **Semana** guardan la última agenda (15 min). Tras cargar Hoy se prefetch de mañana en segundo plano.

## Tema

**Cuenta → Apariencia**: claro, oscuro o sistema.

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
