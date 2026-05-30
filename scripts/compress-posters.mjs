/**
 * Comprime PNG/JPEG en public/posters, public/flagship, public/deportes, etc.
 * Uso: npm run posters:compress
 */
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const TARGET_DIRS = [
  "public/posters",
  "public/flagship",
  "public/deportes",
  "public/ciclismo",
  "public/competition-logos",
];

const MAX_WIDTH = 800;
const PNG_COMPRESSION = 9;
const JPEG_QUALITY = 82;

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(full)));
    } else if (/\.(png|jpe?g)$/i.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

async function compressFile(filePath) {
  const before = (await fs.stat(filePath)).size;
  const ext = path.extname(filePath).toLowerCase();
  const image = sharp(filePath, { failOn: "none" });
  const meta = await image.metadata();

  let pipeline = image.rotate();
  if (meta.width && meta.width > MAX_WIDTH) {
    pipeline = pipeline.resize({ width: MAX_WIDTH, withoutEnlargement: true });
  }

  if (ext === ".png") {
    pipeline = pipeline.png({
      compressionLevel: PNG_COMPRESSION,
      palette: true,
      quality: 90,
      effort: 10,
    });
  } else {
    pipeline = pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true });
  }

  const buffer = await pipeline.toBuffer();
  if (buffer.length >= before) {
    return { filePath, before, after: before, skipped: true };
  }

  await fs.writeFile(filePath, buffer);
  return { filePath, before, after: buffer.length, skipped: false };
}

let totalBefore = 0;
let totalAfter = 0;
let optimized = 0;

for (const rel of TARGET_DIRS) {
  const abs = path.join(ROOT, rel);
  try {
    await fs.access(abs);
  } catch {
    continue;
  }

  const files = await walk(abs);
  for (const file of files) {
    const result = await compressFile(file);
    totalBefore += result.before;
    totalAfter += result.after;
    if (!result.skipped) {
      optimized += 1;
      const pct = ((1 - result.after / result.before) * 100).toFixed(1);
      console.log(`✓ ${path.relative(ROOT, result.filePath)} −${pct}%`);
    }
  }
}

const saved = totalBefore - totalAfter;
const savedPct = totalBefore > 0 ? ((saved / totalBefore) * 100).toFixed(1) : "0";
console.log(
  `\nOptimizados: ${optimized} archivos · ahorro ${(saved / 1024).toFixed(0)} KiB (${savedPct}%)`
);
