import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const OUT = join(process.cwd(), "public", "posters");

const SHOWS = [
  { id: "el-hormiguero", title: "El Hormiguero", subtitle: "Antena 3", c1: "#5d5fef", c2: "#1a1030" },
  { id: "pasapalabra", title: "Pasapalabra", subtitle: "Concurso", c1: "#2563eb", c2: "#0f172a" },
  { id: "la-ruleta", title: "La ruleta", subtitle: "Antena 3", c1: "#d946ef", c2: "#2a0a32" },
  { id: "tu-cara-me-suena", title: "Tu cara me suena", subtitle: "Antena 3", c1: "#ec4899", c2: "#2a0a1e" },
  { id: "la-revuelta", title: "La Revuelta", subtitle: "RTVE", c1: "#1f6e43", c2: "#071510" },
  { id: "suenos-libertad", title: "Sueños de libertad", subtitle: "Ficción", c1: "#a04a2b", c2: "#1a0c08" },
  { id: "la-promesa", title: "La promesa", subtitle: "RTVE", c1: "#0d9488", c2: "#051412" },
  { id: "late-xou", title: "Late Xou", subtitle: "La 2", c1: "#6366f1", c2: "#121228" },
  { id: "operacion-triunfo", title: "Operación Triunfo", subtitle: "RTVE", c1: "#5d5fef", c2: "#101028" },
  { id: "gran-hermano", title: "Gran Hermano", subtitle: "Telecinco", c1: "#dc2626", c2: "#1a0606" },
  { id: "supervivientes", title: "Supervivientes", subtitle: "Telecinco", c1: "#ca8a04", c2: "#1a1406" },
  { id: "eurovision", title: "Eurovisión", subtitle: "RTVE", c1: "#5d5fef", c2: "#120a28" },
  { id: "velada-ibai", title: "La Velada", subtitle: "Twitch", c1: "#9146ff", c2: "#140820" },
];

function escapeXml(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;");
}

function buildPoster({ title, subtitle, c1, c2 }) {
  const safeTitle = escapeXml(title);
  const safeSub = escapeXml(subtitle);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" role="img" aria-label="${safeTitle}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.2" y2="1">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="100%" stop-color="${c2}"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="18%" r="55%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="400" height="600" fill="url(#bg)"/>
  <rect width="400" height="600" fill="url(#glow)"/>
  <rect x="24" y="24" width="352" height="552" rx="18" fill="none" stroke="rgba(255,255,255,0.14)" stroke-width="2"/>
  <text x="200" y="470" text-anchor="middle" fill="#ffffff" font-family="Arial Narrow, Arial, sans-serif" font-size="34" font-weight="700">${safeTitle}</text>
  <text x="200" y="512" text-anchor="middle" fill="rgba(255,255,255,0.72)" font-family="Arial Narrow, Arial, sans-serif" font-size="18" font-weight="600" letter-spacing="3">${safeSub.toUpperCase()}</text>
</svg>`;
}

mkdirSync(OUT, { recursive: true });

for (const show of SHOWS) {
  writeFileSync(join(OUT, `${show.id}.svg`), buildPoster(show), "utf8");
}

console.log(`Generated ${SHOWS.length} posters in public/posters/`);
