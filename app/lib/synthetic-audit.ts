/** UA de Lighthouse, PSI, Playwright y otros crawlers de auditoría. */
export const SYNTHETIC_AUDIT_UA =
  /HeadlessChrome|Headless|Lighthouse|Chrome-Lighthouse|PTST|PageSpeed|Google-InspectionTool|Playwright|Speed Insights|Structured-Data-TestingTool/i

export const SYNTHETIC_AUDIT_HEADER = "x-qvh-audit"

export function isSyntheticAuditUserAgent(userAgent: string): boolean {
  if (!userAgent) return false
  return SYNTHETIC_AUDIT_UA.test(userAgent)
}

/** Lighthouse mobile emula UA Android pero puede enviar x-qvh-audit vía --extra-headers. */
export function isSyntheticAuditRequest(
  userAgent: string,
  auditHeader?: string | null
): boolean {
  if (auditHeader === "1") return true
  return isSyntheticAuditUserAgent(userAgent)
}
