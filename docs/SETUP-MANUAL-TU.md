# Lo que debes hacer tú (copy-paste)

Todo lo demás ya está en el repo y desplegado. **Solo tú** puedes crear cuentas, pegar secretos y autorizar apps externas.

Repo: `https://github.com/aporkour611/queveohoy`

---

## 0. Comprobar qué falta (1 minuto)

En tu PC, después del próximo deploy:

```bash
npm run check:integrations
```

Si ves ✗ en obligatorias → sigue los pasos de abajo en **Vercel**.

---

## 1. Vercel — variables de entorno (Production)

Abre: **https://vercel.com** → tu proyecto **queveohoy** → **Settings** → **Environment Variables**

Marca **Production** en cada una. Pega los valores reales (no dejes vacíos los obligatorios).

### Obligatorias

| Variable | Dónde conseguirla |
|----------|-------------------|
| `NEXT_PUBLIC_SITE_URL` | `https://queveohoy.es` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → API → anon public |
| `SUPABASE_URL` | **Mismo** valor que `NEXT_PUBLIC_SUPABASE_URL` |
| `SUPABASE_ANON_KEY` | **Mismo** valor que anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → API → service_role (secreto) |
| `ADMIN_SECRET` | Genera uno: `openssl rand -hex 32` (o PowerShell abajo) |
| `CRON_SECRET` | Genera **otro** distinto: `openssl rand -hex 32` |
| `FOOTBALL_DATA_API_KEY` | https://www.football-data.org/client/register |
| `TMDB_API_KEY` | https://www.themoviedb.org/settings/api |
| `INDEXNOW_KEY` | Una cadena aleatoria (ej. 32 chars); ver paso 4 |

### Recomendadas (scorecard 10)

| Variable | Dónde |
|----------|--------|
| `UPSTASH_REDIS_REST_URL` | https://console.upstash.com → Redis → REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | Mismo panel → REST TOKEN |
| `PANDASCORE_API_KEY` | https://pandascore.co (e-sports en cron) |
| `BALLDONTLIE_API_KEY` | https://balldontlie.io (NBA) |
| `CRON_ALERT_WEBHOOK_URL` | Webhook Slack/Discord (JSON `{ "text": "..." }`) |

### Opcionales

| Variable | Para qué |
|----------|----------|
| `OPENAI_API_KEY` | Asistente «¿Qué veo?» con IA |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Push notifications |
| `VAPID_PRIVATE_KEY` | Push (genera con `npm run vapid:keys`) |
| `VAPID_SUBJECT` | `mailto:contacto@queveohoy.es` |

### Generar secretos en PowerShell (Windows)

```powershell
# ADMIN_SECRET
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }) -as [byte[]])

# CRON_SECRET (ejecuta otra vez para otro valor)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }) -as [byte[]])
```

**Después de guardar variables:** Vercel → **Deployments** → último deploy → **Redeploy** (sin caché).

---

## 2. GitHub — secrets para CI (Actions)

Abre: **https://github.com/aporkour611/queveohoy/settings/secrets/actions**

Clic **New repository secret** por cada fila:

| Secret | Valor | Obligatorio |
|--------|-------|-------------|
| `VERCEL_TOKEN` | https://vercel.com/account/tokens → Create | **Sí** (deploy) |
| `CRON_SECRET` | **El mismo** que en Vercel | **Sí** (smoke + cron en deploy) |
| `SNYK_TOKEN` | https://app.snyk.io → Account Settings → Auth token | Recomendado |
| `SONAR_TOKEN` | SonarCloud → My Account → Security → Generate (paso 3) | Recomendado |
| `LHCI_GITHUB_APP_TOKEN` | Solo si quieres comentarios Lighthouse en PRs | Opcional |

`VERCEL_TOKEN` y `CRON_SECRET` deben coincidir con lo que usa producción.

---

## 3. SonarCloud (5 minutos)

1. Entra en **https://sonarcloud.io** → Sign up with GitHub  
2. Crea organización (el **slug** importa)  
3. **+** → Analyze new project → importa `aporkour611/queveohoy`  
4. Copia el token → pégalo en GitHub secret `SONAR_TOKEN`  
5. Edita en el repo `sonar-project.properties` y cambia la línea de organización:

```properties
sonar.organization=TU_SLUG_DE_SONARCLOUD
```

Commit y push (o dímelo y lo hacemos). El `sonar.projectKey` suele ser `TU_ORG_queveohoy`.

---

## 4. IndexNow — archivo en `/public`

Si `INDEXNOW_KEY=abc123xyz` (ejemplo), crea en el repo:

**Archivo:** `public/abc123xyz.txt`  
**Contenido:** una sola línea con el mismo valor:

```
abc123xyz
```

Commit + deploy. Comprueba: `https://queveohoy.es/abc123xyz.txt`

---

## 5. Supabase — Auth (Google, Apple, Microsoft / magic link)

Supabase → **Authentication** → **URL Configuration**

| Campo | Valor |
|-------|--------|
| Site URL | `https://queveohoy.es` |
| Redirect URLs | Añade estas dos (una por línea): |

```
https://queveohoy.es/auth/callback
http://localhost:3000/auth/callback
```

Supabase → **Authentication** → **Providers**:

- **Google**: Client ID / Secret desde Google Cloud Console; redirect en Google: `https://TU-PROyecto.supabase.co/auth/v1/callback`
- **Apple**: Service ID, clave `.p8`, Team ID (ver [Supabase Apple](https://supabase.com/docs/guides/auth/social-login/auth-apple))
- **Azure (Microsoft)**: Application ID y secret de Entra ID; redirect URI del registro apuntando al callback de Supabase

Sin activar un proveedor, el botón en `/cuenta/login` fallará al redirigir.

---

## 6. CodeRabbit (reviews automáticos en PRs)

1. Abre: **https://github.com/apps/coderabbitai** (o busca "CodeRabbit" en GitHub Marketplace)  
2. **Install** → elige **aporkour611/queveohoy**  
3. No hace falta configurar nada más: lee `.coderabbit.yaml` del repo  

---

## 7. Snyk (escaneo dependencias)

1. **https://snyk.io** → Sign up with GitHub  
2. Import project `queveohoy` (opcional en UI)  
3. **Account settings → General → Auth Token** → copia  
4. GitHub secret: `SNYK_TOKEN` = ese token  

El workflow `.github/workflows/security.yml` ya lo usa.

---

## 8. Upstash (rate limit en producción)

1. **https://console.upstash.com** → Create database → Redis  
2. Pestaña **REST API** → copia **UPSTASH_REDIS_REST_URL** y **UPSTASH_REDIS_REST_TOKEN**  
3. Pégalos en **Vercel Production** (paso 1)  
4. Redeploy  

---

## 9. Verificación final (copy-paste)

Cuando hayas hecho Vercel + redeploy:

```bash
npm run check:integrations
npm run verify:prod:1.0
```

Probar cron manualmente (sustituye `TU_CRON_SECRET`):

```bash
curl -s "https://queveohoy.es/api/cron" -H "Authorization: Bearer TU_CRON_SECRET" | head -c 500
```

Debe responder JSON con `"ok": true` (no `401 Unauthorized`).

Health con integraciones:

```bash
curl -s "https://queveohoy.es/api/health" | jq .
```

(Sin `jq`: abre https://queveohoy.es/api/health en el navegador.)

---

## Resumen: qué hace el código vs qué haces tú

| Ya hecho en repo / CI | Solo tú |
|----------------------|---------|
| Deploy automático al push `main` | `VERCEL_TOKEN` en GitHub |
| CodeQL, Trivy, Dependabot | `SNYK_TOKEN`, `SONAR_TOKEN` (opcional) |
| API v1/v2, health, cron | Secretos en **Vercel Production** |
| verify-prod-1.0 en deploy | **Redeploy** tras cambiar env |
| `.coderabbit.yaml` | Instalar app CodeRabbit |
| Rate limit Upstash (código listo) | Cuenta Upstash + 2 vars en Vercel |
| IndexNow (código listo) | `INDEXNOW_KEY` + archivo `public/{key}.txt` |
| OAuth callback seguro | Redirect URLs en Supabase (+ Google si aplica) |

---

## Si algo falla

| Síntoma | Revisa |
|---------|--------|
| Feed vacío | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, service role, ejecutar cron |
| Cron 401 | `CRON_SECRET` igual en Vercel y GitHub |
| Login no funciona | Redirect URLs Supabase + Site URL |
| API v2 404 | Espera deploy o redeploy |
| check:integrations ✗ | Variable concreta en Vercel Production |
