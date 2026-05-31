import { isCronAuthorized } from "./admin-auth"

/** Cron Vercel o Bearer CRON_SECRET (GitHub Actions). */
export function isTrustedWarmRequest(request: Request): boolean {
  if (isCronAuthorized(request)) return true
  return request.headers.get("x-vercel-cron") === "1"
}
