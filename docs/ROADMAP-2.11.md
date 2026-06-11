# Roadmap 2.11.0 — Tema, sync push y widget data

Extiende [ROADMAP-2.10.md](./ROADMAP-2.10.md).

## Entregado

| Entrega | Detalle |
|---------|---------|
| Push sync | `GET /api/push/subscribe` + merge al abrir cuenta (web y app) |
| Cuenta web | Panel push inline en pestaña **Avisos** |
| Tema app | Claro / oscuro / sistema (`ThemeProvider`, Cuenta → Apariencia) |
| Widget data | `GET /api/v1/widget/next-favorite` + `mobile/lib/widget-snapshot.ts` |

### Widget nativo (siguiente paso manual)

1. Snapshot en AsyncStorage: clave `qvh:widget:next-favorite`
2. iOS: App Group + Widget Extension (EAS `@bacons/apple-targets` o target manual)
3. Android: `react-native-android-widget` leyendo el mismo JSON vía shared prefs
4. EAS build con perfil `production-store` tras configurar extension

### PSI gate bloqueante

Cuando LCP ≤3s sea estable 2 semanas en producción:

```text
GitHub → Settings → Variables → PERF_GATE_BLOCKING = 1
```

## Siguiente (2.13+)

Ver [ROADMAP-2.12.md](./ROADMAP-2.12.md) (entregado).

- Widget iOS (Expo 54)
- Apple OAuth Supabase prod
