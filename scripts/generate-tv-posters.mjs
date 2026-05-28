import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const OUT = join(process.cwd(), "public", "posters");
const PNG_WIDTH = 800;
const PNG_HEIGHT = 450;

/** Portadas editoriales 16:9 para parrilla TV (400×225 viewBox). */
const SHOWS = [
  {
    id: "el-hormiguero",
    title: "El Hormiguero",
    subtitle: "Antena 3",
    c1: "#ff7328",
    c2: "#1a0a04",
    mark: `<ellipse cx="200" cy="98" rx="52" ry="38" fill="rgba(0,0,0,0.22)"/><circle cx="168" cy="92" r="8" fill="#fff" opacity="0.9"/><circle cx="232" cy="92" r="8" fill="#fff" opacity="0.9"/><path d="M148 118 Q200 142 252 118" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M176 74 L200 52 L224 74 L214 98 L186 98 Z" fill="#ffd166"/>`,
  },
  {
    id: "pasapalabra",
    title: "Pasapalabra",
    subtitle: "Concurso",
    c1: "#2563eb",
    c2: "#0b1533",
    mark: `<circle cx="200" cy="96" r="58" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="3"/><circle cx="200" cy="96" r="42" fill="rgba(255,255,255,0.08)"/><text x="200" y="108" text-anchor="middle" fill="#fff" font-family="Georgia, serif" font-size="42" font-weight="700">Ñ</text>`,
  },
  {
    id: "la-ruleta",
    title: "La ruleta",
    subtitle: "Antena 3",
    c1: "#d946ef",
    c2: "#2a0a32",
    mark: `<circle cx="200" cy="96" r="54" fill="rgba(255,255,255,0.1)" stroke="#fff" stroke-width="3"/><path d="M200 42 L200 96 L238 118" stroke="#ffd166" stroke-width="5" stroke-linecap="round"/>`,
  },
  {
    id: "tu-cara-me-suena",
    title: "Tu cara me suena",
    subtitle: "Antena 3",
    c1: "#ec4899",
    c2: "#2a0a1e",
    mark: `<circle cx="168" cy="96" r="28" fill="rgba(255,255,255,0.15)"/><circle cx="232" cy="96" r="28" fill="rgba(255,255,255,0.15)"/><path d="M140 130 Q200 156 260 130" stroke="#fff" stroke-width="4" fill="none"/>`,
  },
  {
    id: "la-revuelta",
    title: "La Revuelta",
    subtitle: "RTVE",
    c1: "#1f6e43",
    c2: "#071510",
    mark: `<rect x="132" y="58" width="136" height="76" rx="10" fill="rgba(255,255,255,0.12)"/><rect x="148" y="74" width="104" height="12" rx="4" fill="#fff" opacity="0.85"/><rect x="148" y="96" width="72" height="10" rx="4" fill="#fff" opacity="0.55"/>`,
  },
  {
    id: "suenos-libertad",
    title: "Sueños de libertad",
    subtitle: "Ficción",
    c1: "#a04a2b",
    c2: "#1a0c08",
    mark: `<path d="M200 52 C160 92 160 132 200 152 C240 132 240 92 200 52Z" fill="rgba(255,255,255,0.14)"/><path d="M200 68 L200 136" stroke="#ffd166" stroke-width="3"/>`,
  },
  {
    id: "la-promesa",
    title: "La promesa",
    subtitle: "RTVE",
    c1: "#0d9488",
    c2: "#051412",
    mark: `<path d="M128 140 L200 54 L272 140 Z" fill="rgba(255,255,255,0.12)" stroke="#fff" stroke-width="2"/><rect x="182" y="108" width="36" height="32" fill="rgba(255,255,255,0.2)"/>`,
  },
  {
    id: "late-xou",
    title: "Late Xou",
    subtitle: "La 2",
    c1: "#6366f1",
    c2: "#121228",
    mark: `<circle cx="200" cy="96" r="46" fill="rgba(0,0,0,0.25)"/><text x="200" y="108" text-anchor="middle" fill="#fff" font-family="Arial Narrow, Arial, sans-serif" font-size="34" font-weight="800">LX</text>`,
  },
  {
    id: "operacion-triunfo",
    title: "Operación Triunfo",
    subtitle: "RTVE",
    c1: "#5d5fef",
    c2: "#101028",
    mark: `<polygon points="200,52 224,92 272,98 236,128 246,176 200,152 154,176 164,128 128,98 176,92" fill="rgba(255,255,255,0.18)"/>`,
  },
  {
    id: "gran-hermano",
    title: "Gran Hermano",
    subtitle: "Telecinco",
    c1: "#dc2626",
    c2: "#1a0606",
    mark: `<circle cx="200" cy="96" r="50" fill="none" stroke="#fff" stroke-width="4" opacity="0.7"/><circle cx="200" cy="96" r="16" fill="#fff" opacity="0.85"/>`,
  },
  {
    id: "supervivientes",
    title: "Supervivientes",
    subtitle: "Telecinco",
    c1: "#ca8a04",
    c2: "#1a1406",
    mark: `<path d="M120 140 Q200 40 280 140" fill="none" stroke="#ffd166" stroke-width="4"/><path d="M160 140 L200 72 L240 140 Z" fill="rgba(255,255,255,0.12)"/>`,
  },
  {
    id: "eurovision",
    title: "Eurovisión",
    subtitle: "RTVE",
    c1: "#5d5fef",
    c2: "#120a28",
    mark: `<circle cx="200" cy="96" r="48" fill="rgba(255,255,255,0.1)"/><path d="M152 96 H248 M200 48 V144" stroke="#fff" stroke-width="3" opacity="0.5"/><circle cx="200" cy="96" r="10" fill="#ffd166"/>`,
  },
  {
    id: "velada-ibai",
    title: "La Velada VI",
    subtitle: "En directo · Streaming",
    c1: "#9146ff",
    c2: "#140820",
    sponsors: "Twitch · Kick · En directo",
    mark: `<rect x="118" y="48" width="164" height="92" rx="10" fill="rgba(0,0,0,0.35)" stroke="rgba(255,255,255,0.18)" stroke-width="2"/><line x1="200" y1="48" x2="200" y2="140" stroke="rgba(255,255,255,0.12)" stroke-width="2"/><circle cx="168" cy="92" r="22" fill="rgba(255,255,255,0.08)"/><circle cx="232" cy="92" r="22" fill="rgba(255,255,255,0.08)"/><path d="M148 118 Q200 142 252 118" stroke="#ffd166" stroke-width="3" fill="none"/>`,
  },
  {
    id: "mobland-s2",
    title: "MobLand",
    subtitle: "Temporada 2 · Paramount+",
    c1: "#0f766e",
    c2: "#0a0a0c",
    sponsors: "Paramount+ · SkyShowtime",
    mark: `<rect x="132" y="52" width="136" height="88" rx="8" fill="rgba(0,0,0,0.32)" stroke="rgba(201,162,39,0.35)" stroke-width="2"/><path d="M148 120 L200 58 L252 120 L230 132 H170 Z" fill="rgba(201,162,39,0.18)"/><rect x="176" y="96" width="48" height="8" rx="2" fill="#c9a227" opacity="0.75"/>`,
  },
  {
    id: "masterchef",
    title: "MasterChef",
    subtitle: "La 1",
    c1: "#c41e3a",
    c2: "#1a0810",
    mark: `<ellipse cx="200" cy="108" rx="62" ry="18" fill="rgba(0,0,0,0.25)"/><path d="M168 88 L200 58 L232 88 L220 118 L180 118 Z" fill="rgba(255,255,255,0.18)" stroke="#ffd166" stroke-width="2"/>`,
  },
  {
    id: "isla-tentaciones",
    title: "La Isla",
    subtitle: "Telecinco",
    c1: "#db2777",
    c2: "#2a0618",
    mark: `<path d="M110 140 Q200 48 290 140 Z" fill="rgba(255,255,255,0.1)"/><circle cx="168" cy="108" r="14" fill="#fff" opacity="0.75"/><circle cx="232" cy="108" r="14" fill="#fff" opacity="0.75"/><path d="M152 124 Q200 148 248 124" stroke="#ffd166" stroke-width="3" fill="none"/>`,
  },
];

function escapeXml(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;");
}

function sponsorPills(sponsors) {
  if (!sponsors) return "";
  const items = sponsors.split("·").map((s) => s.trim()).filter(Boolean);
  let x = 20;
  let markup = "";
  for (const label of items) {
    const w = Math.max(52, label.length * 5.8 + 16);
    markup += `<rect x="${x}" y="148" width="${w}" height="14" rx="7" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.12)"/>`;
    markup += `<text x="${x + w / 2}" y="158" text-anchor="middle" fill="rgba(255,255,255,0.58)" font-family="Arial Narrow, Arial, sans-serif" font-size="7" font-weight="700" letter-spacing="0.8">${escapeXml(label.toUpperCase())}</text>`;
    x += w + 5;
  }
  return markup;
}

function buildPoster({ title, subtitle, c1, c2, mark, sponsors }) {
  const safeTitle = escapeXml(title);
  const safeSub = escapeXml(subtitle);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 225" role="img" aria-label="${safeTitle}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="100%" stop-color="${c2}"/>
    </linearGradient>
    <radialGradient id="glow" cx="72%" cy="8%" r="65%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="400" height="225" fill="url(#bg)"/>
  <rect width="400" height="225" fill="url(#glow)"/>
  ${mark}
  ${sponsorPills(sponsors)}
  <rect x="0" y="164" width="400" height="61" fill="rgba(0,0,0,0.42)"/>
  <text x="20" y="192" fill="#ffffff" font-family="Arial Narrow, Arial, sans-serif" font-size="22" font-weight="700">${safeTitle}</text>
  <text x="20" y="214" fill="rgba(255,255,255,0.72)" font-family="Arial Narrow, Arial, sans-serif" font-size="12" font-weight="600" letter-spacing="2">${safeSub.toUpperCase()}</text>
</svg>`;
}

mkdirSync(OUT, { recursive: true });

async function main() {
  for (const show of SHOWS) {
    const svg = buildPoster(show);
    writeFileSync(join(OUT, `${show.id}.svg`), svg, "utf8");
    await sharp(Buffer.from(svg))
      .resize(PNG_WIDTH, PNG_HEIGHT)
      .png({ compressionLevel: 9, palette: true, colors: 128, quality: 72, effort: 10 })
      .toFile(join(OUT, `${show.id}.png`));
  }

  console.log(`Generated ${SHOWS.length} SVG + PNG posters in public/posters/`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
