/**
 * Precalienta cache ISR + IndexNow (Bing/Yandex). Google: envía sitemap en Search Console.
 * Uso: CRON_SECRET=xxx npm run ping-indexing
 */
const site =
  process.env.SITE_URL?.replace(/\/$/, "") || "https://queveohoy.es";
const secret = process.env.CRON_SECRET || process.env.ADMIN_SECRET;

if (!secret) {
  console.error("Falta CRON_SECRET (o ADMIN_SECRET) en el entorno.");
  process.exit(1);
}

const url = `${site}/api/indexing/ping`;

const res = await fetch(url, {
  headers: { Authorization: `Bearer ${secret}` },
});

const body = await res.json().catch(() => ({}));
console.log(res.status, JSON.stringify(body, null, 2));

if (!res.ok || !body.ok) {
  process.exit(1);
}

console.log(
  `\nGoogle Search Console: añade el sitemap ${body.sitemap ?? `${site}/sitemap.xml`}`
);
