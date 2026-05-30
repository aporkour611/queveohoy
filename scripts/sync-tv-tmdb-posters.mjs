/**
 * Obtiene poster_path oficial de TMDB para programas flagship.
 * Uso: node scripts/sync-tv-tmdb-posters.mjs
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";

/** ID TMDB (tv) por programa — España / emisión actual cuando aplica. */
const TMDB_TV_IDS = {
  "el-hormiguero": 45829,
  pasapalabra: 78652,
  "tu-cara-me-suena": 62086,
  "la-ruleta": 117648,
  "la-revuelta": 270462,
  "suenos-libertad": 239526,
  "la-promesa": 212907,
  "late-xou": 247061,
  "isla-tentaciones": 95676,
  masterchef: 49982,
  "operacion-triunfo": 33788,
  "gran-hermano": 4658,
  supervivientes: 10957,
  "mask-singer": 93784,
  eurovision: 44264,
};

function extractPosterPath(html) {
  const ogMatch = html.match(
    /property="og:image"\s+content="https:\/\/media\.themoviedb\.org\/t\/p\/w500([^"]+)"/
  );
  if (ogMatch?.[1]) return ogMatch[1];

  const legacyMatch = html.match(
    /property="og:image"\s+content="https:\/\/image\.tmdb\.org\/t\/p\/w500([^"]+)"/
  );
  if (legacyMatch?.[1]) return legacyMatch[1];

  const posterImg = html.match(
    /class="poster w-full"\s+src="https:\/\/media\.themoviedb\.org\/t\/p\/[^/]+\/([^"?]+)/
  );
  if (posterImg?.[1]) return `/${posterImg[1]}`;

  return null;
}

async function fetchPosterPath(tmdbId) {
  const res = await fetch(`https://www.themoviedb.org/tv/${tmdbId}`, {
    headers: { "User-Agent": "queveohoy-poster-sync/1.0" },
  });
  if (!res.ok) return null;
  const html = await res.text();
  const path = extractPosterPath(html);
  if (!path) return null;
  return path.startsWith("/") ? path : `/${path}`;
}

async function main() {
  const results = {};

  for (const [showId, tmdbId] of Object.entries(TMDB_TV_IDS)) {
    try {
      const posterPath = await fetchPosterPath(tmdbId);
      results[showId] = { tmdbId, posterPath };
      console.log(
        posterPath
          ? `✓ ${showId} (${tmdbId}) → ${posterPath}`
          : `✗ ${showId} (${tmdbId}) sin póster`
      );
    } catch (error) {
      console.error(`✗ ${showId}:`, error.message);
      results[showId] = { tmdbId, posterPath: null };
    }
  }

  const outPath = join(process.cwd(), "app", "lib", "spanish-tv-tmdb-posters.json");
  writeFileSync(outPath, `${JSON.stringify(results, null, 2)}\n`, "utf8");
  console.log(`\nSaved ${outPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
