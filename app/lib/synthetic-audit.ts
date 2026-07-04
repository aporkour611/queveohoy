/** UA de Lighthouse, PSI, Playwright y otros crawlers de auditoría. */
export const SYNTHETIC_AUDIT_UA =
  /HeadlessChrome|Headless|Lighthouse|Chrome-Lighthouse|PTST|PageSpeed|Google-InspectionTool|Playwright|Speed Insights|Structured-Data-TestingTool/i

export function isSyntheticAuditUserAgent(userAgent: string): boolean {
  if (!userAgent) return false
  return SYNTHETIC_AUDIT_UA.test(userAgent)
}
