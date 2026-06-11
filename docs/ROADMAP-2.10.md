# Roadmap 2.10.0 — Stores, favoritos push y offline semana

Extiende [ROADMAP-2.9.md](./ROADMAP-2.9.md).

## Entregado

| Entrega | Detalle |
|---------|---------|
| Push solo favoritos | Toggle en Cuenta + sync servidor |
| Offline semana | Caché 15 min en pestaña Semana (+ banner sin red) |
| Microsoft login | OAuth `azure` en app |
| EAS stores | Perfiles `*-store` con `--auto-submit`; tag `mobile-v*` → Play Internal |
| Deep link push | Tap en notificación abre evento en web |

### EAS / stores (manual)

1. `eas credentials` + Google Play service account / Apple App Store Connect API key
2. GitHub **`EXPO_TOKEN`**
3. Actions → **EAS Build** → perfil `preview-store` (Android internal) o tag `mobile-v1.0.0`
4. iOS TestFlight: perfil `production-store` + credenciales Apple en EAS

## Siguiente (2.11+)

- Widget iOS / Android (próximo evento favorito)
- Tema claro en app
- Sincronizar preferencias push con `/cuenta` web
