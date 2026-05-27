import { afterEach, describe, expect, it, vi } from "vitest";
import { buildContentSecurityPolicy } from "./security-headers";

describe("security-headers", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("incluye directivas clave en producción", () => {
    expect(buildContentSecurityPolicy(true)).toContain("default-src 'self'");
    expect(buildContentSecurityPolicy(true)).toContain(
      "upgrade-insecure-requests"
    );
    expect(buildContentSecurityPolicy(true)).toContain(
      "https://vitals.vercel-insights.com"
    );
  });

  it("relaja eval en desarrollo", () => {
    expect(buildContentSecurityPolicy(false)).toContain("'unsafe-eval'");
    expect(buildContentSecurityPolicy(false)).not.toContain(
      "upgrade-insecure-requests"
    );
  });
});
