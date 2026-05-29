import { writeFileSync, mkdirSync, readFileSync, existsSync, renameSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const RECIPES_PATH = join(ROOT, "app", "lib", "poster-recipes.json");
const recipeData = JSON.parse(readFileSync(RECIPES_PATH, "utf8"));

const PNG_W = 400;
const PNG_H = 600;

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;");
}

function sponsorPills(sponsors, y = 548) {
  const items = sponsors.split("·").map((s) => s.trim()).filter(Boolean);
  const gap = 6;
  let x = 20;
  let markup = "";
  for (const label of items) {
    const w = Math.max(58, label.length * 6.2 + 18);
    markup += `<rect x="${x}" y="${y}" width="${w}" height="18" rx="9" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.14)"/>`;
    markup += `<text x="${x + w / 2}" y="${y + 12}" text-anchor="middle" fill="rgba(255,255,255,0.62)" font-family="Arial Narrow, Arial, sans-serif" font-size="8" font-weight="700" letter-spacing="1">${escapeXml(label.toUpperCase())}</text>`;
    x += w + gap;
  }
  return markup;
}

function posterSvg({
  title,
  subtitle,
  sponsors,
  sky,
  glow,
  beam,
  mark,
  footer = "",
}) {
  const safeTitle = escapeXml(title);
  const safeSub = escapeXml(subtitle);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" role="img" aria-label="${safeTitle}">
  <defs>
    <linearGradient id="sky" x1="0%" y1="0%" x2="0%" y2="100%">${sky}</linearGradient>
    <radialGradient id="glow" cx="50%" cy="22%" r="68%">${glow}</radialGradient>
    <linearGradient id="beam" x1="0%" y1="0%" x2="100%" y2="100%">${beam}</linearGradient>
    <filter id="blur"><feGaussianBlur stdDeviation="16"/></filter>
  </defs>
  <rect width="400" height="600" fill="url(#sky)"/>
  <rect width="400" height="600" fill="url(#glow)"/>
  <rect x="-40" y="70" width="480" height="130" fill="url(#beam)" transform="rotate(-10 200 300)"/>
  ${mark}
  <path d="M0 420 Q140 360 200 385 T400 405 V600 H0 Z" fill="#050505" opacity="0.82"/>
  <rect x="0" y="468" width="400" height="132" fill="rgba(0,0,0,0.55)"/>
  <text x="200" y="502" text-anchor="middle" fill="#ffffff" font-family="Arial Black, Helvetica, sans-serif" font-size="34" font-weight="900" letter-spacing="2">${safeTitle}</text>
  <text x="200" y="528" text-anchor="middle" fill="rgba(255,255,255,0.72)" font-family="Arial Narrow, Arial, sans-serif" font-size="12" font-weight="700" letter-spacing="4">${safeSub.toUpperCase()}</text>
  ${footer}
  ${sponsorPills(sponsors)}
</svg>`;
}

const POSTERS = Object.entries(recipeData.recipes)
  .filter(([, recipe]) => recipe.sky && "mark" in recipe)
  .map(([id, recipe]) => ({
    id: recipe.assetId ?? id,
    dir: recipe.dir,
    title: recipe.title,
    subtitle: recipe.subtitle,
    sponsors: recipe.sponsors,
    sky: recipe.sky,
    glow: recipe.glow,
    beam: recipe.beam,
    mark: recipe.mark ?? "",
    logoFile: recipe.logoFile,
    logoWidth: recipe.logoWidth ?? 240,
    logoTop: recipe.logoTop ?? 130,
  }));

async function compositeOfficialLogo(poster, pngPath) {
  if (!poster.logoFile) return;

  const logoPath = join(ROOT, "public", poster.logoFile);
  if (!existsSync(logoPath)) {
    console.warn(`Logo missing: ${poster.logoFile}`);
    return;
  }

  const logoBuffer = await sharp(logoPath)
    .resize(poster.logoWidth, null, { fit: "inside" })
    .png()
    .toBuffer();

  const meta = await sharp(logoBuffer).metadata();
  const left = Math.round((PNG_W - (meta.width ?? poster.logoWidth)) / 2);
  const tmpPath = `${pngPath}.tmp`;

  await sharp(pngPath)
    .composite([{ input: logoBuffer, top: poster.logoTop, left }])
    .png({ compressionLevel: 9, palette: true, quality: 82 })
    .toFile(tmpPath);

  renameSync(tmpPath, pngPath);
}

async function writePoster(poster) {
  const outDir = join(ROOT, "public", poster.dir);
  mkdirSync(outDir, { recursive: true });
  const svg = posterSvg(poster);
  const base = join(outDir, poster.id);
  writeFileSync(`${base}.svg`, svg, "utf8");
  const pngPath = `${base}.png`;
  await sharp(Buffer.from(svg))
    .resize(PNG_W, PNG_H)
    .png({ compressionLevel: 9, palette: true, quality: 80 })
    .toFile(pngPath);

  await compositeOfficialLogo(poster, pngPath);
}

async function main() {
  for (const poster of POSTERS) {
    await writePoster(poster);
  }

  const esportsSources = ["cs2", "valorant", "lol"];
  for (const id of esportsSources) {
    const svgPath = join(ROOT, "public", "esports", `${id}.svg`);
    const svg = readFileSync(svgPath);
    await sharp(svg)
      .resize(PNG_W, PNG_H)
      .png({ compressionLevel: 9, palette: true, quality: 80 })
      .toFile(join(ROOT, "public", "esports", `${id}.png`));
  }

  console.log(
    `Generated ${POSTERS.length} sport SVG + PNG posters from poster-recipes.json and ${esportsSources.length} esports PNGs`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
