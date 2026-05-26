export const ADMIN_COOKIE = "qvh_admin";

export function getAdminSecret(): string {
  return (
    process.env.ADMIN_SECRET?.trim() ||
    process.env.CRON_SECRET?.trim() ||
    ""
  );
}

export function isAdminCookieValid(cookieValue?: string | null): boolean {
  const secret = getAdminSecret();
  return Boolean(secret && cookieValue === secret);
}
