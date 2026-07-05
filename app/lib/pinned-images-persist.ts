import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  type PinnedImageRegistry,
  basketTeamRegistryKey,
  esportsTeamRegistryKey,
  footballTeamRegistryKey,
  lookupPinnedByKey,
  lookupPinnedLocalUrl,
  pinnedRegistry,
} from "./pinned-images";
import { normalizeRemoteImageUrl } from "./remote-image";

const REGISTRY_PATH = join(process.cwd(), "app/lib/pinned-images.json");
const CRESTS_ESPORTS_DIR = join(process.cwd(), "public/crests/esports");
const CRESTS_FOOTBALL_DIR = join(process.cwd(), "public/crests/football");
const CRESTS_BASKET_DIR = join(process.cwd(), "public/crests/basket");

function canWritePublicAssets(): boolean {
  if (process.env.PINNED_IMAGES_READONLY === "1") return false;
  try {
    mkdirSync(CRESTS_ESPORTS_DIR, { recursive: true });
    const probe = join(CRESTS_ESPORTS_DIR, ".write-probe");
    writeFileSync(probe, "1");
    return existsSync(probe);
  } catch {
    return false;
  }
}

function loadRegistryMutable(): PinnedImageRegistry {
  try {
    return JSON.parse(readFileSync(REGISTRY_PATH, "utf8")) as PinnedImageRegistry;
  } catch {
    return { version: 1, byKey: {}, byRemote: {} };
  }
}

function saveRegistry(reg: PinnedImageRegistry) {
  writeFileSync(REGISTRY_PATH, `${JSON.stringify(reg, null, 2)}\n`);
}

async function probeUrl(url: string, timeoutMs = 6_000): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: "HEAD",
      signal: AbortSignal.timeout(timeoutMs),
      redirect: "follow",
    });
    if (res.ok) return true;
    const get = await fetch(url, {
      method: "GET",
      signal: AbortSignal.timeout(timeoutMs),
      redirect: "follow",
    });
    return get.ok;
  } catch {
    return false;
  }
}

/** Primera URL remota que responde 200 (o local ya fijada). */
export async function pickWorkingImageUrl(
  candidates: string[],
  registryKey?: string | null
): Promise<string | null> {
  if (registryKey) {
    const pinned = lookupPinnedByKey(registryKey);
    if (pinned) return pinned;
  }

  const seen = new Set<string>();
  for (const raw of candidates) {
    const pinned = lookupPinnedLocalUrl(raw);
    if (pinned) return pinned;

    const normalized = normalizeRemoteImageUrl(raw);
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);

    if (await probeUrl(normalized)) return normalized;
  }

  return candidates.map(normalizeRemoteImageUrl).find(Boolean) ?? null;
}

async function downloadBytes(url: string): Promise<Buffer | null> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(12_000),
      redirect: "follow",
    });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    return buf.length > 64 ? buf : null;
  } catch {
    return null;
  }
}

export type PinResult = {
  url: string;
  pinned: boolean;
  local?: string;
};

/** Descarga escudo e-sports a public/crests/esports/{id}.png y registra (si FS escribible). */
export async function pinEsportsTeamLogo(
  teamId: number,
  workingRemoteUrl: string
): Promise<PinResult> {
  const key = esportsTeamRegistryKey(teamId);
  const existing = lookupPinnedByKey(key);
  if (existing) return { url: existing, pinned: true, local: existing };

  const normalized = normalizeRemoteImageUrl(workingRemoteUrl);
  if (!normalized) return { url: workingRemoteUrl, pinned: false };

  if (!canWritePublicAssets()) {
    return { url: normalized, pinned: false };
  }

  const bytes = await downloadBytes(normalized);
  if (!bytes) return { url: normalized, pinned: false };

  mkdirSync(CRESTS_ESPORTS_DIR, { recursive: true });
  const localPath = `/crests/esports/${teamId}.png`;
  const abs = join(process.cwd(), "public", localPath.slice(1));
  writeFileSync(abs, bytes);

  const reg = loadRegistryMutable();
  reg.byKey[key] = {
    local: localPath,
    remote: normalized,
    kind: "esports-team",
    pinnedAt: new Date().toISOString(),
  };
  reg.byRemote[normalized] = localPath;
  saveRegistry(reg);

  return { url: localPath, pinned: true, local: localPath };
}

/** Resuelve mejor logo e-sports: prueba candidatos, opcionalmente fija en disco. */
export async function resolveAndPinEsportsLogo(
  teamId: number | null | undefined,
  candidates: string[]
): Promise<string | null> {
  const key = teamId != null ? esportsTeamRegistryKey(teamId) : null;
  const working = await pickWorkingImageUrl(candidates, key);
  if (!working) return null;
  if (working.startsWith("/crests/")) return working;
  if (teamId != null) {
    const pinned = await pinEsportsTeamLogo(teamId, working);
    return pinned.url;
  }
  return working;
}

export async function pinFootballTeamCrest(teamId: string): Promise<PinResult | null> {
  const key = footballTeamRegistryKey(teamId);
  const existing = lookupPinnedByKey(key);
  if (existing) return { url: existing, pinned: true, local: existing };

  const remote = `https://crests.football-data.org/${teamId}.png`;
  if (!(await probeUrl(remote))) return null;
  if (!canWritePublicAssets()) return { url: remote, pinned: false };

  const bytes = await downloadBytes(remote);
  if (!bytes) return { url: remote, pinned: false };

  mkdirSync(CRESTS_FOOTBALL_DIR, { recursive: true });
  const localPath = `/crests/football/${teamId}.png`;
  writeFileSync(join(process.cwd(), "public", localPath.slice(1)), bytes);

  const reg = loadRegistryMutable();
  reg.byKey[key] = {
    local: localPath,
    remote,
    kind: "football-team",
    pinnedAt: new Date().toISOString(),
  };
  reg.byRemote[remote] = localPath;
  saveRegistry(reg);

  return { url: localPath, pinned: true, local: localPath };
}

export async function pinBasketTeamCrest(abbr: string, remoteUrl: string): Promise<PinResult> {
  const key = basketTeamRegistryKey(abbr);
  const existing = lookupPinnedByKey(key);
  if (existing) return { url: existing, pinned: true, local: existing };

  const normalized = normalizeRemoteImageUrl(remoteUrl);
  if (!normalized || !(await probeUrl(normalized))) {
    return { url: remoteUrl, pinned: false };
  }
  if (!canWritePublicAssets()) return { url: normalized, pinned: false };

  const bytes = await downloadBytes(normalized);
  if (!bytes) return { url: normalized, pinned: false };

  mkdirSync(CRESTS_BASKET_DIR, { recursive: true });
  const localPath = `/crests/basket/${abbr.trim().toUpperCase()}.png`;
  writeFileSync(join(process.cwd(), "public", localPath.slice(1)), bytes);

  const reg = loadRegistryMutable();
  reg.byKey[key] = {
    local: localPath,
    remote: normalized,
    kind: "basket-team",
    pinnedAt: new Date().toISOString(),
  };
  reg.byRemote[normalized] = localPath;
  saveRegistry(reg);

  return { url: localPath, pinned: true, local: localPath };
}

/** Solo lectura del registro embebido (tests). */
export { pinnedRegistry };
