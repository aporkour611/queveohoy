import { createHmac, timingSafeEqual } from "crypto";

export const ADMIN_COOKIE = "qvh_admin";
const ADMIN_SESSION_VERSION = "v1";
const ADMIN_SESSION_MAX_AGE_SEC = 60 * 60 * 24

function isLocalDevOnly(): boolean {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.VERCEL_ENV !== "preview" &&
    process.env.VERCEL_ENV !== "production"
  )
}

export function getAdminSecret(): string {
  return process.env.ADMIN_SECRET?.trim() ?? "";
}

export function isAdminConfigured(): boolean {
  return Boolean(getAdminSecret());
}

export function getCronSecret(): string {
  return process.env.CRON_SECRET?.trim() ?? "";
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch {
    return false;
  }
}

export function createAdminSessionToken(): string | null {
  const secret = getAdminSecret();
  if (!secret) return null;

  const issued = Math.floor(Date.now() / 1000);
  const payload = `${ADMIN_SESSION_VERSION}:${issued}`;
  const signature = createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");

  return `${payload}.${signature}`;
}

export function isAdminCookieValid(cookieValue?: string | null): boolean {
  const secret = getAdminSecret();
  if (!secret || !cookieValue) return false;

  let raw = cookieValue;
  try {
    raw = decodeURIComponent(cookieValue);
  } catch {
    raw = cookieValue;
  }

  const dot = raw.lastIndexOf(".");
  if (dot <= 0) return false;

  const payload = raw.slice(0, dot);
  const signature = raw.slice(dot + 1);
  if (!payload.startsWith(`${ADMIN_SESSION_VERSION}:`)) return false;

  const issued = Number(payload.split(":")[1]);
  if (!Number.isFinite(issued)) return false;

  const ageSec = Math.floor(Date.now() / 1000) - issued;
  if (ageSec < 0 || ageSec > ADMIN_SESSION_MAX_AGE_SEC) return false;

  const expected = createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");

  return safeEqual(signature, expected);
}

export function isAdminRequest(request: Request): boolean {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const match = cookieHeader.match(
    new RegExp(`(?:^|;\\s*)${ADMIN_COOKIE}=([^;]+)`)
  );
  return isAdminCookieValid(match?.[1]);
}

export function verifyAdminSecret(candidate: string): boolean {
  const secret = getAdminSecret();
  return Boolean(secret && candidate && safeEqual(candidate, secret));
}

export function adminSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE_SEC,
  };
}

/** Vercel Cron envía `Authorization: Bearer CRON_SECRET`. */
export function isCronAuthorized(request: Request): boolean {
  const secret = getCronSecret();
  if (!secret) {
    return isLocalDevOnly();
  }

  const auth = request.headers.get("authorization")?.trim();
  if (!auth?.startsWith("Bearer ")) return false;

  const token = auth.slice("Bearer ".length);
  return safeEqual(token, secret);
}
