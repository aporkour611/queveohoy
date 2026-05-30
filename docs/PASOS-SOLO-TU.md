# Solo tú puedes hacer esto (el resto ya está hecho)

## Estado actual (comprobado)

- Web **https://queveohoy.es** → OK, 161 eventos, versión 1.0.1
- Falta **1 variable** en Vercel: `ADMIN_SECRET` (panel /admin)
- Lo demás opcional: Upstash, push, CodeRabbit, Snyk

---

## PASO ÚNICO OBLIGATORIO (3 minutos)

### Opción A — Importar todo de una vez (recomendado)

1. En tu PC, en la carpeta del proyecto, ejecuta (o pide a alguien):

```bash
node scripts/generate-vercel-import.mjs
```

2. Se crea el archivo **`.env.production.import`** en la carpeta del proyecto.

3. Abre **https://vercel.com** → proyecto **queveohoy** → **Settings** → **Environment Variables**

4. Clic en **Import .env** (o **Import**)

5. Selecciona el archivo **`.env.production.import`**

6. Environment: **Production** → **Save**

7. **Deployments** → **⋯** → **Redeploy** → sin caché

### Opción B — Solo la que falta

1. Vercel → **Environment Variables** → **Add New**
2. Key: `ADMIN_SECRET`
3. Value:

```
wWJGizM3rGrsYF32YEEbTHKCnUieKEeFtNSoWXPABGE=
```

4. **Production** → **Save** → **Redeploy**

**Login admin:** https://queveohoy.es/admin/login con esa contraseña.

---

## OPCIONAL — cuando quieras

### CodeRabbit (reviews en GitHub)

1. Abre: https://github.com/apps/coderabbitai/installations/new
2. **Install** → elige **aporkour611/queveohoy**

### Upstash (rate limit pro)

1. https://console.upstash.com → Create Redis
2. REST API → copia URL y TOKEN
3. Vercel → añade `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN` → Redeploy

---

## Comprobar después del redeploy

Abre: https://queveohoy.es/api/health  

Debe salir `"adminSecret": true` dentro de `integrations`.
