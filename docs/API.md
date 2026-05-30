# API pública queveohoy.es (v1)

API read-only para integrar la agenda de TV, streaming y deportes en España.

**Base URL:** `https://queveohoy.es`  
**Versión:** `1` (estable desde v2.0.0 del producto)  
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

### Respuesta 200

```json
{
  "version": "1",
  "generatedAt": "2026-05-30T18:00:00.000Z",
  "timezone": "Europe/Madrid",
  "date": "2026-05-30",
  "count": 42,
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

## Compatibilidad

- `/api/events` sigue disponible para la web (sin versionar).
- Cambios breaking irán en `/api/v2/...` con aviso previo en novedades.
