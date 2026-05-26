/**
 * Avisa a Bing/Yandex de todas las URLs (IndexNow).
 * Uso: CRON_SECRET=xxx npm run ping-search
 * Opcional: SITE_URL=https://queveohoy.es
 */
const site =
  process.env.SITE_URL?.replace(/\/$/, "") || "https://queveohoy.es";
const secret = process.env.CRON_SECRET || process.env.ADMIN_SECRET;

if (!secret) {
  console.error("Falta CRON_SECRET (o ADMIN_SECRET) en el entorno.");
  process.exit(1);
}

const url = `${site}/api/indexnow/ping`;

const res = await fetch(url, {
  headers: { Authorization: `Bearer ${secret}` },
});

const body = await res.json().catch(() => ({}));
console.log(res.status, body);

if (!res.ok || !body.ok) {
  process.exit(1);
}
