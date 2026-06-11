# Roadmap 2.12.0 — Semana ISR + widget Android

Extiende [ROADMAP-2.11.md](./ROADMAP-2.11.md).

## Entregado

| Entrega | Detalle |
|---------|---------|
| Semana ISR | Feed semanal en SSR (`getWeekViewFeedEventsForPage`) → vista «Semana completa» instantánea |
| Prefetch | `<link rel="prefetch">` a `/api/events?scope=week` |
| Widget Android | `NextFavorite` con `react-native-android-widget` + snapshot AsyncStorage |
| App config | `mobile/app.config.ts` con plugin widget (requiere EAS build, no Expo Go) |

### Widget Android (manual)

1. `cd mobile && eas build --profile preview --platform android`
2. Instala APK/AAB en dispositivo
3. Mantén pulsado escritorio → Widgets → **Próximo favorito**
4. Marca favoritos en la app; el widget se actualiza al guardar snapshot

### iOS widget

Pendiente 2.13 (`expo-widgets` requiere SDK 54+).

### PSI gate

Activar `PERF_GATE_BLOCKING=1` en GitHub vars cuando LCP ≤3s sea estable 2 semanas.

## Siguiente (2.13+)

- Widget iOS (Expo 54 + expo-widgets)
- Prefetch semana en `/explorar`
- Upgrade Expo 54 en mobile CI
