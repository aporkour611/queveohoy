/**
 * Fija escudos remotos en public/crests y actualiza pinned-images.json.
 * Uso: npm run crests:pin
 */
import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import {
  isEsportsSport,
  parseEsportsTeamLogos,
  pandascoreTeamLogoCandidates,
} from "../app/lib/esports.ts";
import { extractPandascoreTeamId } from "../app/lib/pinned-images.ts";
import {
  pinEsportsTeamLogo,
  pickWorkingImageUrl,
  pinFootballTeamCrest,
  pinBasketTeamCrest,
} from "../app/lib/pinned-images-persist.ts";
import { parseFootballTeamIds } from "../app/lib/football.ts";
import { parseBasketTeamLogos, basketLogoFallbackUrls } from "../app/lib/basketball.ts";

const LIMIT = Number(process.env.CRESTS_PIN_LIMIT ?? 200);

function loadDotEnv() {
  for (const file of [".env.local", ".env"]) {
    if (!existsSync(file)) continue;
    for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (process.env[key] == null) process.env[key] = val;
    }
  }
}

function createSupabaseForPin() {
  loadDotEnv();
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Faltan SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY (.env.local)");
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function main() {
  let sb;
  try {
    sb = createSupabaseForPin();
  } catch (e) {
    console.error(String(e));
    process.exit(1);
  }

  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await sb
    .from("events")
    .select("external_id,source,sport,home_team,away_team")
    .gte("date", today)
    .limit(LIMIT);

  if (error) {
    console.error(error.message);
    process.exit(1);
  }

  let pinned = 0;
  let probed = 0;

  for (const row of data ?? []) {
    const sport = row.sport ?? "";

    if (isEsportsSport(sport)) {
      const logos = parseEsportsTeamLogos(row.source);
      for (const side of [logos?.homeUrl, logos?.awayUrl]) {
        if (!side) continue;
        const teamId = extractPandascoreTeamId(side);
        if (teamId == null) continue;
        probed += 1;
        const working = await pickWorkingImageUrl(
          pandascoreTeamLogoCandidates({ id: teamId, image_url: side }),
          `esports:team:${teamId}`
        );
        if (!working) continue;
        const result = await pinEsportsTeamLogo(teamId, working);
        if (result.pinned) pinned += 1;
      }
      continue;
    }

    if (sport === "futbol") {
      const ids = parseFootballTeamIds(row.external_id, row.source, row.home_team, row.away_team);
      if (!ids) continue;
      for (const id of [ids.homeId, ids.awayId]) {
        probed += 1;
        const result = await pinFootballTeamCrest(id);
        if (result?.pinned) pinned += 1;
      }
      continue;
    }

    if (sport === "basket") {
      const logos = parseBasketTeamLogos(row.source, row.home_team, row.away_team);
      if (!logos?.homeAbbr || !logos?.awayAbbr) continue;
      for (const abbr of [logos.homeAbbr, logos.awayAbbr]) {
        probed += 1;
        const remote = basketLogoFallbackUrls(abbr)[0];
        const result = await pinBasketTeamCrest(abbr, remote);
        if (result.pinned) pinned += 1;
      }
    }
  }

  console.log(`crests:pin · probed=${probed} · newly pinned=${pinned}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
