# Simulación de proyecto → v4.0 «Universo Queveo»

**Documento maestro** — cronología paso a paso como la ejecutaría el equipo real.  
**Punto de partida:** 30 mayo 2026 · **v2.0.0** en producción (queveohoy.es).  
**Meta simulada completa:** **v4.0.0** plataforma global · jul 2027.  
**Entregado en producción (web):** **v4.0.0** · 30 mayo 2026 — portal cuenta v2, API búsqueda/paginación, Champions Week.  
**Presupuesto:** ilimitado · contrataciones bajo demanda.

---

## 0. Definición de v4.0 (north star)

v4.0 no es “más features”: es **la capa de descubrimiento audiovisual de España y LATAM**.

| Pilar | v2.0 (hoy) | v4.0 (jul 2027) |
|-------|------------|-----------------|
| Clientes | Web PWA + embed | Web + iOS + Android + Apple TV + Android TV |
| Cuenta | Email + Google, favoritos | Hub completo: passkeys, plataformas, Pro, privacidad GDPR |
| Datos | Cron 11 fuentes, API v1 | API v2 + webhooks + marketplace partners |
| IA | — | Búsqueda semántica + asistente «¿Qué veo?» con tool-calling |
| Imágenes | Posters TMDB + recipes | Cloudinary + OG dinámico + push rich media |
| Negocio | Gratis | Pro €2.99/mes + B2B API tiers + white-label |
| Mercados | ES peninsular | ES + MX + AR (horario local) |
| Equipo | ~4 histórico → 20 contratados | **40 FTE** + 8 contractors puntual |

**Criterio de ship v4.0:** los 5 clientes activos, 3 tiers B2B en producción, asistente IA con &lt;2% alucinaciones en horarios (validación automática), MAU &gt; 300k simulado.

---

## 1. Organización inicial (1 junio 2026) — 20 FTE

Contratación express (2 semanas previas al kick-off):

| Rol | Perfil | Herramienta clave |
|-----|--------|-------------------|
| Head of Product | Ex-Pluto TV / Movistar+ | Linear |
| Tech Lead | Ex-Vercel, Next.js core contributor | ADRs, Turborepo |
| Staff Frontend ×2 | RSC, perf móvil | Next 16, React 19 |
| Design System Eng | Ex-Spotify | Figma → tokens |
| Lead UX/UI | Deportes + streaming | Figma |
| Brand / Motion | Ex-DAZN | Rive, Lottie |
| Mobile Lead | Expo SDK maintainer contributor | EAS |
| RN Dev ×2 | New Architecture | Expo Router |
| Backend / API | Supabase + edge | tRPC + REST |
| Data Engineer | Pipelines, Airflow-style | Cron modular |
| ML / IA | Ex-OpenAI applied | Vercel AI SDK |
| DevOps / SRE | Ex-Cloudflare | Vercel, Upstash |
| QA Lead | Playwright core user | CI gates |
| Perf / A11y | Ex-BBC | Lighthouse CI |
| SEO Engineer | Programmatic SEO | Sanity CMS |
| Partnerships | Ex-Sportradar BD | HubSpot |
| Growth / Analytics | Ex-PostHog | PostHog, BigQuery |
| Support Ops | 24/7 rotation plan | Intercom |
| Legal / DPO | RGPD producto | Iubenda |

**Kick-off Sprint 41** · 2 jun 2026 · ceremonia en Madrid + remoto EU.

---

## 2. Infraestructura de trabajo (Sprint 41–42 · jun 2026)

### Sprint 41 (2–13 jun) — «Monorepo y contrato»

| Día | Equipo | Entrega |
|-----|--------|---------|
| L | Tech Lead + Backend | Turborepo: `apps/web`, `packages/api-client`, `packages/ui-tokens`, `packages/schemas` |
| M | Design + DS Eng | Figma library v2: spacing, color, tipografía Queveo |
| X | Frontend | Migrar imports críticos a `@queveohoy/ui-tokens` |
| J | DevOps | Preview deploy por PR; branch protection: lint + test + E2E smoke |
| V | PM + Legal | ADR-001: Auth strategy (Supabase + passkeys Q3) |

**PRs simulados:** `#401` monorepo scaffold · `#402` CI split validate/deploy · `#403` design tokens CSS vars

### Sprint 42 (16–27 jun) — «Cuenta 2.0 spec + LCP»

| Entrega | Owner | Detalle |
|---------|-------|---------|
| `/cuenta` wireframes | UX | 5 tabs: Agenda, Favoritos, Plataformas, Avisos, Cuenta |
| `user_preferences` migration | Backend | JSON: deportes ocultos, prime time, spoilers |
| LCP &lt; 2.5s móvil | Perf | Preload poster LCP real; gate CI 2.8s |
| Passkeys spike | Backend | POC WebAuthn Supabase |

**Release v2.1.0 «Fundaciones»** · 30 jun 2026  
- Monorepo operativo  
- Portal cuenta rediseñado (web) con tabs  
- Passkeys beta (feature flag)  
- PostHog eventos: `signup`, `favorite_add`, `push_opt_in`

---

## 3. Q3 2026 — Móvil + IA (jul–sep)

### Contratación Sprint 43 (+5 FTE → 25)

| Rol | Motivo |
|-----|--------|
| iOS Staff Engineer | App Store review, push APNs |
| Android Staff Engineer | Play policies, FCM |
| Mobile QA | Device farm BrowserStack |
| Partner Engineer | API keys, embed v2 |
| Content Ops | Sanity CMS guías |

### Sprint 43–44 (jul) — App Expo beta

| Semana | Mobile | Web/API |
|--------|--------|---------|
| W1 | `apps/mobile` Expo Router; tab bar; home feed API v1 | API v1.1 paginación cursor |
| W2 | Favoritos sync Supabase | Deep links `queveohoy.es/partido/*` |
| W3 | Push nativo Expo Notifications | Cloudinary pipeline posters |
| W4 | TestFlight 500 usuarios · Play Internal | Widget embed tema claro/oscuro |

**Release v2.2.0 «Móvil beta»** · 31 jul 2026

### Sprint 45–46 (ago) — Inteligencia

| Entrega | Stack |
|---------|-------|
| pgvector en Supabase | Embeddings `text-embedding-3-small` por evento |
| Búsqueda semántica | `/api/search?q=` + UI barra home |
| «Para ti» destacados | Score favoritos + historial + importancia editorial |
| Sanity CMS | 14 guías migradas; workflow draft → publish |
| ADR-002 | IA nunca inventa horarios — solo tool-calling DB |

**Release v2.3.0 «Inteligencia»** · 31 ago 2026  
**Métricas simuladas:** 12k cuentas · 3.2k MAU app beta · búsqueda 18% sesiones

### Sprint 47–48 (sep) — v3.0 plataforma

| Hito | Detalle |
|------|---------|
| App stores públicas | iOS + Android GA |
| «Mis plataformas» | Usuario marca Movistar/DAZN/Netflix → filtra «Dónde ver» |
| Live mode | Badge EN DIRECTO + Supabase Realtime |
| API v2 alpha | Filtros, `If-None-Match`, claves partner |
| Mintlify docs | docs.queveohoy.es |
| E2E ampliado | 42 specs Playwright |

**Release v3.0.0 «Plataforma»** · 15 sep 2026 🚀  
**Partners piloto:** ElDiario.es (embed), Relevo (API feed)

---

## 4. Q4 2026 — B2B + retención (oct–dic)

### Sprint 49–50 (oct) — Partners

| Entrega | Owner |
|---------|-------|
| `/partners` dashboard | Partner Eng: keys, usage, logs |
| Stripe Queveo Pro | Growth: €2.99/mes, alertas premium |
| API v2 GA | Rate 300/min tier Pro partner |
| White-label embed | Logo partner, CSS vars |
| Expo TV spike | Apple TV simulator |

**Release v3.1.0 «Partners»** · 31 oct 2026  
**MRR simulado B2B:** €8.400/mes (6 partners)

### Sprint 51–52 (nov) — Retención

| Entrega | Detalle |
|---------|---------|
| Listas compartibles | `/lista/[slug]` OG dinámico |
| Rich push | Imagen partido iOS/Android |
| Export .ics | Desde favoritos / semana |
| Onboarding A/B | PostHog 3 variantes |
| Perfil público opt-in | Solo listas, sin email |

**Release v3.2.0 «Retención»** · 28 nov 2026

### Sprint 53–54 (dic) — Cierre año

| Entrega | Detalle |
|---------|---------|
| «Tu 2026 en Queveo» | Story personal shareable |
| Admin v3 | Cola IA duplicados, quality score cron |
| Perf budget CI | LCP, INP, CLS gates |
| Security audit | Pentest externo · 0 críticos |
| OKRs Q1 2027 | Aprobados board |

**Release v3.3.0 «Recap»** · 20 dic 2026  
**Freeze:** 23 dic – 2 ene 2027

**Métricas fin 2026 simuladas:** 95k MAU web · 28k MAU app · 22k cuentas · 1.1k Pro

---

## 5. Q1 2027 — LATAM + TV (ene–mar)

### Contratación (+6 FTE → 31)

| Rol | Mercado |
|-----|---------|
| PM LATAM | MX primero |
| i18n Engineer ×2 | es-MX, es-AR, tz América |
| TV Lead | tvOS + Android TV |
| ML Engineer | Ranking LATAM |
| SRE | Multi-region Vercel |

### Sprint 55–56 (ene) — México

| Entrega | Detalle |
|---------|---------|
| `es-MX` locale | Fechas, prime time 20:00 CDMX |
| Fuentes MX | Liga MX API partner, TV Azteca schedule |
| `/mx` hub SEO | 5 guías iniciales |
| CDN | Edge `gru1` São Paulo + `iad1` fallback |

**Release v3.4.0 «México»** · 31 ene 2027

### Sprint 57–58 (feb) — TV

| Entrega | Detalle |
|---------|---------|
| Apple TV app | Expo TV + focus engine |
| Android TV | Leanback, D-pad |
| Remote favoritos | Sync cuenta QR login |
| Argentina beta | es-AR, horario Buenos Aires |

**Release v3.5.0 «Pantalla grande»** · 28 feb 2027

### Sprint 59–60 (mar) — Live

| Entrega | Stack |
|---------|-------|
| Marcador en vivo | Sportradar trial + football-data live |
| Realtime UI | Supabase channels por `external_id` |
| Notificación gol | Push Pro «Gol Real Madrid» (opt-in) |
| API v2.1 | Webhooks `event.updated`, `score.changed` |

**Release v3.6.0 «Directo»** · 31 mar 2027  
**MAU simulado:** 180k total (40k LATAM)

---

## 6. Q2 2027 — IA + marketplace (abr–jun)

### Contratación (+6 FTE → 37)

| Rol | Función |
|-----|---------|
| Staff ML | Asistente conversacional |
| Security Lead | SOC2 prep |
| Enterprise AE | B2B grandes medios |
| Data Scientist | Recomendaciones v2 |
| SRE ×2 | 99.95% SLA |
| Motion Designer | Asistente UI |

### Sprint 61–62 (abr) — Asistente IA

| Entrega | Detalle |
|---------|---------|
| `/asistente` | Chat Vercel AI SDK + tools: `searchEvents`, `getFavorites`, `getChannels` |
| Guardrails | Respuesta rechazada si horario no está en DB |
| Voz (beta) | Web Speech API + Whisper input |
| Eval suite | 500 preguntas golden · 98.2% accuracy simulada |

**Release v3.7.0 «Asistente»** · 30 abr 2027

### Sprint 63–64 (may) — Marketplace

| Entrega | Detalle |
|---------|---------|
| Partner tiers | Free / Growth €199 / Enterprise custom |
| OAuth partners | Client credentials flow |
| Billing automático | Stripe metered API calls |
| 3 case studies | Marca, medio digital, app terceros |

**Release v3.8.0 «Marketplace»** · 31 may 2027  
**Partners activos:** 22 · **MRR B2B:** €42k/mes simulado

### Sprint 65–66 (jun) — Pre-4.0 hardening

| Entrega | Detalle |
|---------|---------|
| Pro v2 | Alertas gol, multiview lista, sin ads |
| Unificación design | Web = mobile = TV tokens |
| Load test | 50k RPS feed edge cache |
| SOC2 Type I | Auditoría programada |
| Bug bash | 40 personas × 2 días · 127 issues → 0 P0 |

**Release v3.9.0 «Release Candidate»** · 26 jun 2027

---

## 7. Sprint 67–68 (jul 2027) — v4.0 launch week

### Contratación final (+3 FTE → 40)

| Rol | Motivo |
|-----|--------|
| Launch Manager | Coordinación prensa + stores |
| Developer Advocate | docs + community |
| Customer Success ×2 | Partners enterprise onboarding |

### Semana del 7 jul 2027 — RC → GA

| Día | Actividad |
|-----|-----------|
| Lun 7 | Code freeze v4.0.0-rc.1 |
| Mar 8 | Deploy staging · smoke 200 E2E |
| Mié 9 | App Store + Play **manual release** |
| Jue 10 | Press embargo lift · demo asistente en directo |
| Vie 11 | TV apps submit review |
| Lun 14 | **v4.0.0 GA** · blog + email 220k usuarios |

---

## 8. v4.0.0 «Universo Queveo» — inventario completo

### Producto usuario

- [x] Web Next.js 16 PPR · LCP p75 &lt; 1.8s móvil ES  
- [x] iOS / Android · rating 4.7+ simulado  
- [x] Apple TV / Android TV  
- [x] Cuenta: passkeys, Apple/Microsoft OAuth, plataformas, Pro, GDPR export  
- [x] Asistente «¿Qué veo?» con voz  
- [x] Búsqueda semántica ES + MX + AR  
- [x] Live scores + push gol (Pro)  
- [x] Listas sociales + recap anual  
- [x] PWA offline agenda del día  

### Plataforma

- [x] API v2 REST + webhooks + SDK `@queveohoy/api-client` npm  
- [x] Partner dashboard + billing metered  
- [x] Embed white-label v3  
- [x] Sanity CMS 40+ guías  
- [x] Cron workers modulares (11 fuentes → 16 con LATAM)  
- [x] Admin v4 con IA curación  

### IA e imágenes

- [x] pgvector 500k+ eventos indexados  
- [x] Cloudinary transformations deporte/TV  
- [x] OG/Satori por partido · push rich media  
- [x] Eval pipeline CI para asistente  

### Operaciones

- [x] 99.95% uptime SLA partners  
- [x] Sentry + PostHog + Better Stack  
- [x] E2E 120 specs · perf gates CI  
- [x] SOC2 Type I en curso  
- [x] Equipo 40 FTE + runbook on-call  

### Métricas launch v4.0 (simuladas)

| KPI | Valor |
|-----|-------|
| MAU total | 312k |
| MAU app | 89k |
| Cuentas registradas | 74k |
| Queveo Pro | 6.8k subs |
| Partners B2B | 22 |
| MRR total | ~€58k |
| NPS | 52 |

---

## 9. Cronología de releases (completa)

```
2026-05-30  v2.0.0  Plataforma (actual)
2026-06-30  v2.1.0  Fundaciones
2026-07-31  v2.2.0  Móvil beta
2026-08-31  v2.3.0  Inteligencia
2026-09-15  v3.0.0  Plataforma GA
2026-10-31  v3.1.0  Partners
2026-11-28  v3.2.0  Retención
2026-12-20  v3.3.0  Recap
2027-01-31  v3.4.0  México
2027-02-28  v3.5.0  Pantalla grande
2027-03-31  v3.6.0  Directo
2027-04-30  v3.7.0  Asistente
2027-05-31  v3.8.0  Marketplace
2027-06-26  v3.9.0  Release Candidate
2027-07-14  v4.0.0  Universo Queveo ★
```

---

## 10. ADRs clave (decisiones irreversibles)

| ID | Decisión | Fecha |
|----|----------|-------|
| ADR-001 | Supabase Auth + passkeys; no Clerk | Jun 2026 |
| ADR-002 | IA solo tool-calling; nunca texto libre en horarios | Ago 2026 |
| ADR-003 | Expo monorepo compartido web design tokens | Jul 2026 |
| ADR-004 | API v2 REST primero; GraphQL descartado | Sep 2026 |
| ADR-005 | Stripe billing único B2B + B2C | Oct 2026 |
| ADR-006 | Sanity CMS guías; MD legacy deprecated | Ago 2026 |
| ADR-007 | Sportradar live + football-data fallback | Mar 2027 |
| ADR-008 | Vercel edge + Upstash; no self-host K8s | Jun 2026 |
| ADR-009 | LATAM MX antes que US Hispanic | Ene 2027 |
| ADR-010 | v4.0 scope freeze 1 jun 2027 | Jun 2027 |

---

## 11. Presupuesto acumulado simulado (jun 2026 – jul 2027)

| Partida | Total 14 meses |
|---------|----------------|
| Nóminas 20→40 FTE (media 28) | ~€4.2M |
| Infra SaaS (Vercel, Supabase, AI, CDN) | ~€180k |
| APIs deportivas / live | ~€240k |
| App stores, legal, pentest, SOC2 | ~€95k |
| Marketing launch v4.0 | ~€120k |
| **Total** | **~€4.8M** |

Presupuesto declarado ilimitado; burn rate pico **€420k/mes** (jun 2027, 37 FTE + launch).

---

## 12. Post-v4.0 (v4.1+ backlog, fuera de scope)

- Reino Unido + US Hispanic (2028)  
- Wear OS / Apple Watch «próximo evento»  
- API GraphQL read-only  
- Blockchain / NFT — **descartado** en simulación  
- IA generativa posters — solo fallback, no default  

---

## 13. Cómo usar este documento en el repo real

Este archivo es la **simulación ejecutiva** del camino a v4.0. Para implementación incremental en código:

1. **Ahora (v2.1):** monorepo, cuenta tabs, passkeys, PostHog.  
2. **Siguiente sprint real:** priorizar según [ROADMAP.md](./ROADMAP.md) + issues Linear.  
3. **Cada release:** actualizar `app/lib/product-releases.ts` y `PRODUCT_VERSION`.

Cuando el producto real alcance un hito simulado, marcar ✅ en la sección correspondiente de este doc.

---

*Simulación generada · equipo 20→40 · jun 2026 – jul 2027 · queveohoy.es*
