import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ADMIN_COOKIE,
  createAdminSessionToken,
  getAdminSecret,
  getCronSecret,
  isAdminCookieValid,
  isAdminRequest,
  isCronAuthorized,
  verifyAdminSecret,
} from "./admin-auth";

describe("admin-auth", () => {
  beforeEach(() => {
    vi.stubEnv("ADMIN_SECRET", "admin-secret-test");
    vi.stubEnv("CRON_SECRET", "cron-secret-test");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("separa admin y cron secret", () => {
    expect(getAdminSecret()).toBe("admin-secret-test");
    expect(getCronSecret()).toBe("cron-secret-test");
  });

  it("verifica la clave admin con timing-safe compare", () => {
    expect(verifyAdminSecret("admin-secret-test")).toBe(true);
    expect(verifyAdminSecret("wrong")).toBe(false);
  });

  it("emite y valida cookie firmada", () => {
    const token = createAdminSessionToken();
    expect(token).toBeTruthy();
    expect(isAdminCookieValid(token)).toBe(true);
    expect(isAdminCookieValid("tampered.token")).toBe(false);
  });

  it("detecta sesión admin en request", () => {
    const token = createAdminSessionToken();
    const request = new Request("https://queveohoy.es/admin", {
      headers: { cookie: `${ADMIN_COOKIE}=${token}` },
    });
    expect(isAdminRequest(request)).toBe(true);
  });

  it("autoriza cron con bearer token", () => {
    const ok = new Request("https://queveohoy.es/api/cron", {
      headers: { authorization: "Bearer cron-secret-test" },
    });
    const bad = new Request("https://queveohoy.es/api/cron", {
      headers: { authorization: "Bearer wrong" },
    });

    expect(isCronAuthorized(ok)).toBe(true);
    expect(isCronAuthorized(bad)).toBe(false);
  });
});
