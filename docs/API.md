# API pública queveohoy.es (v1)

API read-only para integrar la agenda de TV, streaming y deportes en España.

**Base URL:** `https://queveohoy.es`  
**Versión:** `1` (estable; ampliada en v4.0.0 del producto)  
**Zona horaria:** `Europe/Madrid` (península y Baleares)

---

## Autenticación

No requiere clave. Uso público con rate limit por IP.

| Límite | Valor |
|--------|-------|
| Peticiones | 60 / minuto / IP |
| Cabecera 429 | `Retry-After` en segundos |

---

## CORS

`GET` y `OPTIONS` permiten `Access-Control-Allow-Origin: *`.

---

## `GET /api/v1/feed`

Eventos del día en Madrid.

### Query

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `date` | `YYYY-MM-DD` | Opcional. Por defecto: hoy en Madrid. |
| `limit` | `1–100` | Opcional. Tamaño de página (default 50). |
| `cursor` | string | Opcional. Cursor devuelto en `nextCursor`. |
| `categories` | string | Opcional **(v1.1)**. IDs separados por coma (`futbol`, `formula1`, `tv-reality`, …). |

### Respuesta 200

```json
{
  "version": "1",
  "generatedAt": "2026-05-30T18:00:00.000Z",
  "timezone": "Europe/Madrid",
  "date": "2026-05-30",
  "count": 42,
  "nextCursor": "MTIz",
  "events": [
    {
      "id": 12345,
      "title": "Real Madrid vs Barcelona",
      "date": "2026-05-30",
      "time": "21:00",
      "sport": "football",
      "platform": "Movistar LaLiga",
      "competition": "LaLiga",
      "url": "https://queveohoy.es/partido/2026-05-30-real-madrid-vs-barcelona"
    }
  ],
  "attribution": "Datos de queveohoy.es — cita la fuente al reutilizar.",
  "docs": "https://queveohoy.es/desarrolladores"
}
```

### Errores

| Código | Significado |
|--------|-------------|
| 429 | Rate limit |
| 502 | Error temporal al cargar datos |

---

## `GET /api/v1/search`

Búsqueda de eventos por texto (equipos, competición, plataforma). Coincidencia por tokens: todas las palabras deben aparecer.

### Query

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `q` | string | Obligatorio, mínimo 2 caracteres. |
| `date` | `YYYY-MM-DD` | Opcional. Filtra por fecha. |
| `limit` | `1–100` | Opcional. Default 50. |
| `cursor` | string | Paginación. |

### Ejemplo

```bash
curl "https://queveohoy.es/api/v1/search?q=real%20madrid&limit=10"
```

---

## `GET /api/v1/events/[id]`

Detalle de un evento por ID numérico de la base de datos.

### Respuesta 200

```json
{
  "version": "1",
  "event": {
    "id": 12345,
    "title": "Real Madrid vs Barcelona",
    "date": "2026-05-30",
    "time": "21:00",
    "sport": "football",
    "platform": "Movistar LaLiga",
    "competition": "LaLiga",
    "url": "https://queveohoy.es/partido/2026-05-30-real-madrid-vs-barcelona"
  }
}
```

| Código | Significado |
|--------|-------------|
| 400 | ID inválido |
| 404 | Evento no encontrado |
| 429 | Rate limit |
| 502 | Error temporal |

---

## Widget embed

Incrusta la selección «Qué ver esta noche» (desde 18:00 h):

```html
<iframe
  src="https://queveohoy.es/embed/esta-noche"
  title="Qué ver esta noche — queveohoy.es"
  width="420"
  height="520"
  loading="lazy"
></iframe>
```

La ruta `/embed/*` permite `frame-ancestors *` para uso en sitios de terceros.

---

## Atribución

Al mostrar datos en público, incluye un enlace visible a [queveohoy.es](https://queveohoy.es).

---

## API v2 — `GET /api/v2/feed`

Mismos query params que v1, más **ETag** / **304** y claves partner opcionales.

### Sin clave (público)

60 peticiones/minuto por IP (igual que v1).

### Con clave partner

| Cabecera | Valor |
|----------|--------|
| `X-API-Key` | Clave acordada |
| o `Authorization` | `Bearer <clave>` |

| Límite | Valor por defecto |
|--------|-------------------|
| Peticiones | 300 / minuto / partner (`PARTNER_API_RATE_LIMIT` en servidor) |

Configuración en Vercel: `PARTNER_API_KEYS=secreto:EtiquetaPartner,secreto2:Otro`.

| Código | Significado |
|--------|-------------|
| 401 | Clave partner inválida |
| 304 | `If-None-Match` coincide con `etag` |

### Respuesta 200 (extracto)

```json
{
  "version": "2",
  "etag": "\"abc123\"",
  "scopes": ["day", "categories", "cursor", "partner"],
  "partner": { "id": "mediaset", "label": "Mediaset", "tier": "partner" },
  "rateLimit": { "limit": 300, "windowSec": 60 },
  "events": []
}
```

### Webhooks (partners Pro)

Tras cada cron de ingesta, si la clave incluye URL de webhook:

```
PARTNER_API_KEYS=secreto:MiMedio|https://tu-servidor.com/webhook/qvh
```

**POST** al webhook con cuerpo JSON:

```json
{
  "event": "feed.updated",
  "generatedAt": "2026-05-31T18:00:00.000Z",
  "date": "2026-05-31",
  "eventCount": 234,
  "version": "2.3.0"
}
```

Cabeceras:

| Cabecera | Descripción |
|----------|-------------|
| `X-Queveohoy-Event` | `feed.updated` |
| `X-Queveohoy-Partner` | ID del partner (slug de la etiqueta) |
| `X-Queveohoy-Signature` | `sha256=<hmac_hex>` del cuerpo con tu clave API |

Verifica la firma con HMAC-SHA256 del body en bruto usando la misma clave que en `X-API-Key`.

---

## Compatibilidad

- `/api/events` sigue disponible para la web (sin versionar).
- v1 no usa claves partner; v2 las soporta de forma opcional.
