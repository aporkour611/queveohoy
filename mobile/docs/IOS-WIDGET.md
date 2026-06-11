# Widget iOS — Próximo favorito

Estado: **planificado** (requiere upgrade a Expo 54 + `expo-widgets`).

## Qué ya existe

| Pieza | Estado |
|-------|--------|
| API `GET /api/v1/widget/next-favorite` | ✅ (Bearer Supabase) |
| Lógica `pickNextFavoriteEvent` | ✅ web + app |
| Widget Android `NextFavorite` | ✅ EAS build |
| Snapshot AsyncStorage en app | ✅ |
| WidgetHint en Cuenta (iOS) | ✅ mensaje «próximamente» |

## Pasos para iOS

1. **Upgrade Expo 52 → 54** en `mobile/package.json` (breaking; probar auth + push)
2. Añadir **`expo-widgets`** y target extension en Xcode vía EAS
3. Reutilizar `readWidgetSnapshot()` / `fetchRemoteWidgetSnapshot()`
4. Build `production-store` → TestFlight
5. Documentar en App Store Connect (widget de agenda deportiva)

## Manual mientras tanto

- Usuarios iOS: pestaña **Favoritos** + push nativo
- Enlace **Gestionar en la web** en Cuenta para export RGPD

## Referencias

- [mobile/README.md](../README.md)
- [ROADMAP-3.00.md](../../docs/ROADMAP-3.00.md)
