# Solo tú puedes hacer esto (el resto ya está hecho)

## Estado actual

- Web **https://queveohoy.es** — producción activa
- Variables críticas en Vercel: Supabase, `CRON_SECRET`, `ADMIN_SECRET`
- Opcional: Upstash, push VAPID, OpenAI

---

## PASO ÚNICO OBLIGATORIO (si falta ADMIN_SECRET)

### Opción A — Importar todo de una vez (recomendado)

1. En tu PC, en la carpeta del proyecto:

```bash
node scripts/generate-vercel-import.mjs
```

2. Se crea **`.env.production.import`** (solo si tienes `.env.local` con las claves).

3. **https://vercel.com** → proyecto **queveohoy** → **Settings** → **Environment Variables**

4. **Import .env** → selecciona `.env.production.import` → **Production** → **Save**

5. Haz un **nuevo deployment** (push a `main` o workflow Deploy Production). Un redeploy del dashboard **no** aplica env vars nuevas.

### Opción B — Solo la que falta

1. Vercel → **Environment Variables** → **Add New**
2. Key: `ADMIN_SECRET`
3. Value: genera uno nuevo (no reutilices valores de documentación):

```powershell
# PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

```bash
# macOS/Linux
openssl rand -base64 32
```

4. **Production** → **Save** → nuevo deployment (push a main)

**Login admin:** https://queveohoy.es/admin/login con esa contraseña.

### Opción C — GitHub Actions

1. GitHub → **Settings** → **Secrets and variables** → **Actions**
2. Añade secret `ADMIN_SECRET` con el valor generado arriba
3. Push a `main` para disparar **Deploy Production**

---

## OPCIONAL — cuando quieras

### Upstash (rate limit distribuido)

1. https://console.upstash.com → Create Redis
2. REST API → copia URL y TOKEN
3. Vercel → `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN` → nuevo deploy

---

## Comprobar después del deploy

```bash
npm run verify:prod
CRON_SECRET=... npm run release:prod
```

Health público (`/api/health`) no expone integraciones. Con `CRON_SECRET` el script las lista.
