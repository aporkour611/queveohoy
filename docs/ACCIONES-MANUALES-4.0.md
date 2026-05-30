# Acciones manuales — v4.0 «Universo Queveo»

Listado de tareas que **solo tú puedes hacer** (permisos, cuentas externas, dashboards).  
El código de la **v4.0 web** ya está en `main`; esto desbloquea producción y las fases siguientes del [ROADMAP-4.0](./ROADMAP-4.0.md).

---

## 🔴 Obligatorio ahora (para que v4.0 funcione al 100 %)

### 1. Migración Supabase — `user_preferences`

Sin esto, **Mis plataformas** en `/cuenta` falla al guardar.

1. Entra en [Supabase Dashboard](https://supabase.com/dashboard) → tu proyecto → **SQL Editor**.
2. Pega y ejecuta el contenido de:

   `supabase/migrations/20260530120000_user_preferences.sql`

3. Comprueba en **Table Editor** que existe la tabla `user_preferences`.

### 2. Variables de entorno en Vercel (Production)

Revisa en **Vercel → Project → Settings → Environment Variables** que están definidas (ver `.env.example`):

| Variable | Para qué |
|----------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Auth, favoritos, preferencias |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Cliente web |
| `SUPABASE_SERVICE_ROLE_KEY` | Cron, admin |
| `ADMIN_SECRET` | Panel `/admin` |
| `CRON_SECRET` | `/api/cron` |
| `FOOTBALL_DATA_API_KEY` | Partidos fútbol |
| `TMDB_API_KEY` | Cine, series, posters |
| `INDEXNOW_KEY` | Indexación Bing |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` + `VAPID_PRIVATE_KEY` | Push web |

Opcional pero recomendado: `CRON_ALERT_WEBHOOK_URL` (Slack/Discord si el cron falla).

### 3. Verificar deploy v4.0.0 en producción

> **Nota:** Si varios pushes seguidos, GitHub Actions encola deploys (`concurrency: production-deploy`). Si un run queda colgado en «Deploy prebuilt», cancela el job viejo o redeploy manual desde [Vercel Dashboard](https://vercel.com).

1. Abre [Deploy Production](https://github.com/aporkour611/queveohoy/actions/workflows/deploy.yml) → último run en verde.
2. Comprueba en https://queveohoy.es:
   - Footer: **v4.0.0**
   - [/novedades](https://queveohoy.es/novedades): release 4.0.0 arriba
   - [/cuenta](https://queveohoy.es/cuenta): menú lateral (Favoritos · Plataformas · Avisos · Cuenta)
   - Final Champions: **30 may · 18:00 h**

---

## 🟠 Recomendado esta semana

### 4. Probar flujo de cuenta completo

- [ ] Registro / login magic link
- [ ] Login con Google (OAuth configurado en Supabase)
- [ ] Guardar 2–3 plataformas en **Mis plataformas**
- [ ] Añadir favorito en home → aparece en `/cuenta`
- [ ] **Descargar mis datos** (pestaña Cuenta → export JSON)
- [ ] Push: campana en home → activar categoría

### 5. OAuth social adicional (opcional v4.0+)

En **Supabase → Authentication → Providers**:

- [ ] **Apple** — requiere Apple Developer ($99/año) + Service ID
- [ ] **Microsoft/Azure** — app en Azure Portal + redirect URI Supabase

### 6. Passkeys / WebAuthn (roadmap v4.1)

En **Supabase → Authentication → Settings**:

- [ ] Activar **WebAuthn** cuando quieras login biométrico
- Dominio producción: `queveohoy.es` debe estar en lista de sitios permitidos

---

## 🟡 Fase 4.0 ampliada (requiere contratar / registrarse)

Estas piezas están en el roadmap simulado; **no están en el código aún**.

### 7. App móvil (Expo)

| Paso | Acción tuya |
|------|-------------|
| Cuenta | [expo.dev](https://expo.dev) + plan EAS |
| Apple | Apple Developer Program ($99/año) |
| Google | Google Play Console ($25 one-time) |
| Certificados | APNs (iOS) + FCM (Android) en EAS credentials |
| Stores | Fichas App Store / Play Store, capturas, política privacidad |

### 8. Queveo Pro (Stripe)

1. Cuenta [Stripe](https://stripe.com) → modo live.
2. Producto **Queveo Pro** ~€2,99/mes.
3. Añadir en Vercel: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
4. Webhook endpoint: `https://queveohoy.es/api/stripe/webhook` (cuando exista en código).

### 9. Asistente IA «¿Qué veo?»

1. API key [OpenAI](https://platform.openai.com) o [Anthropic](https://console.anthropic.com).
2. Vercel: `OPENAI_API_KEY` o `ANTHROPIC_API_KEY`.
3. Límite de gasto mensual en el panel del proveedor.

### 10. Imágenes dinámicas (Cloudinary)

1. Cuenta [Cloudinary](https://cloudinary.com).
2. Vercel: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.

### 11. Analytics (PostHog)

1. Proyecto en [PostHog](https://posthog.com).
2. Vercel: `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`.

### 12. Partners B2B / API v2

- [ ] Contactar 2–3 medios piloto (embed + API)
- [ ] Decidir pricing tiers (Free / Growth / Enterprise)
- [ ] Dominio docs: `docs.queveohoy.es` (Mintlify o similar)

### 13. Live scores (Sportradar u otro)

- [ ] Contrato o trial API deportiva en vivo
- [ ] Vercel: clave API + presupuesto (suele ser caro)

### 14. LATAM (México / Argentina)

- [ ] Fuentes de datos locales (Liga MX, TV MX)
- [ ] Revisión legal horarios por país
- [ ] Dominio o subpath `/mx` en Search Console

### 15. CMS guías (Sanity)

- [ ] Proyecto [Sanity.io](https://sanity.io)
- [ ] Vercel: `SANITY_PROJECT_ID`, `SANITY_DATASET`, token escritura

---

## 🟢 Legal y operaciones

### 16. RGPD

- [x] Exportación de datos disponible en `/cuenta` → Cuenta → Descargar mis datos
- [x] [/privacidad](https://queveohoy.es/privacidad) menciona exportación y `user_preferences`
- [ ] DPO / registro tratamientos si escala usuarios registrados
- [ ] Cookie consent: revisar categorías si añades PostHog marketing

### 17. Monitorización

- [ ] [Sentry](https://sentry.io) o similar → DSN en Vercel (opcional)
- [ ] Uptime en [Better Stack](https://betterstack.com) o UptimeRobot para home + `/api/cron`

### 18. GitHub / CI

- [ ] `VERCEL_TOKEN` en GitHub Secrets (si el deploy falla por auth)
- [ ] Branch protection en `main`: require status checks (validate + deploy)

---

## Checklist rápido (copiar en Notion/Todo)

```
[ ] SQL user_preferences en Supabase
[ ] Env vars Vercel revisadas
[ ] Deploy #121+ en verde
[ ] Footer muestra v4.0.0
[ ] /cuenta → plataformas guardan OK
[ ] Export JSON datos personales OK
[ ] Champions final hoy 18:00 OK
[ ] (Opcional) Apple/Microsoft OAuth
[ ] (Fase 2) Expo + stores
[ ] (Fase 2) Stripe Pro
[ ] (Fase 2) OpenAI asistente
[ ] (Fase 2) Cloudinary
[ ] (Fase 2) PostHog
[ ] (Fase 2) Partners piloto
```

---

## Qué ya hizo el agente (no necesitas repetir)

- Portal cuenta v2 con tabs y Mis plataformas
- API `PATCH /api/cuenta/preferences`
- API `GET /api/cuenta/export` (RGPD)
- API `GET /api/v1/search` + paginación en feed
- Final PSG–Arsenal 30 may 18:00 + hover escudos
- Tests (181), lint, build, push a `main`
- Script `npm run validate` y verificación prod `npm run verify:prod:v4`
- Documentación: CHANGELOG, API.md, ROADMAP-4.0.md

---

*Última actualización: 30 mayo 2026 · v4.0.0 web*
