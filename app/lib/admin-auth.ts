export const ADMIN_COOKIE = "qvh_admin";

export function getAdminSecret(): string {
  return (
    process.env.ADMIN_SECRET?.trim() ||
    process.env.CRON_SECRET?.trim() ||
    ""
  );
}

export function getCronSecret(): string {
  return (
    process.env.CRON_SECRET?.trim() ||
    process.env.ADMIN_SECRET?.trim() ||
    ""
  );
}

export function isAdminCookieValid(cookieValue?: string | null): boolean {
  const secret = getAdminSecret();
  return Boolean(secret && cookieValue === secret);
}

/** Vercel Cron envía `Authorization: Bearer CRON_SECRET`. */
export function isCronAuthorized(request: Request): boolean {
  const secret = getCronSecret();
  if (!secret) {
    return process.env.NODE_ENV !== "production";
  }

  const auth = request.headers.get("authorization")?.trim();
  return auth === `Bearer ${secret}`;
}
