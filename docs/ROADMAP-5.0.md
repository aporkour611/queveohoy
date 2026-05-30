# Roadmap 5.0 — Personalización e IA

Versión objetivo: **5.0.0** · Benchmark sector (JustWatch, TVTime, Reelgood, Flashscore…)

## Entregado en v5.0

| ID | Feature | Estado |
|----|---------|--------|
| D2 | Filtro global «Solo mis plataformas» | ✅ |
| D5 | Hero / sección «Para ti esta noche» | ✅ |
| D4 | Drawer detalle evento | ✅ |
| D15 | Asistente IA «¿Qué veo?» | ✅ (OpenAI opcional) |

## Arquitectura

- **`app/lib/personalized-tonight.ts`** — scoring prime time + plataformas + favoritos
- **`app/lib/assistant-core.ts`** — fallback smart sin LLM + mapeo tarjetas
- **`POST /api/assistant`** — Vercel AI SDK + tools sobre agenda real
- **`TonightForYouSection`** — SSR en home con carousel
- **`EventDrawerProvider`** — drawer lateral/bottom sheet
- **`AssistantFab` + `/asistente`**

## Variables de entorno

```bash
OPENAI_API_KEY=   # opcional; sin key → modo smart local
```

## Verificación

```bash
npm run validate
npm run verify:prod:v5   # tras deploy
```

## Pendiente manual (heredado v4)

- Migración Supabase `user_preferences` si no ejecutada
- `OPENAI_API_KEY` en Vercel para IA completa

## Próximo (v5.x / v6)

- Dark mode (D7)
- Motion library unificada (D6)
- Design system v2 (D1)
- Feed móvil rediseñado (D3)
