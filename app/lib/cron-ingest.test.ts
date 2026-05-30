import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { isCronAuthorized } from "./admin-auth";
import { formatCronIngestAlert } from "./cron-alerts";
import { prepareEventsForImport } from "./cron-events";

vi.mock("./event-enrich", () => ({
  enrichEventCrests: vi.fn(async (event: { title?: string | null }) => event),
}));

describe("cron ingest smoke", () => {
  beforeEach(() => {
    vi.stubEnv("CRON_SECRET", "cron-secret-test");
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("rechaza cron no autorizado", () => {
    const unauthorized = new Request("https://queveohoy.es/api/cron");
    const wrongToken = new Request("https://queveohoy.es/api/cron", {
      headers: { authorization: "Bearer wrong" },
    });

    expect(isCronAuthorized(unauthorized)).toBe(false);
    expect(isCronAuthorized(wrongToken)).toBe(false);
  });

  it("filtra deportes bloqueados en prepareEventsForImport", async () => {
    const prepared = await prepareEventsForImport([
      { sport: "dota2", title: "Team Spirit vs Gaimin" },
      { sport: "tenis", title: "Alcaraz vs Sinner", competition: "Roland Garros" },
    ]);

    expect(prepared.map((event) => event.sport)).toEqual(["tenis"]);
    expect(vi.mocked(fetch)).not.toHaveBeenCalled();
  });

  it("formatea alertas de resumen de cron", () => {
    expect(formatCronIngestAlert({})).toBe("Cron ingest: sin cambios.");
    expect(formatCronIngestAlert({ inserted: 12, purged: 3 })).toBe(
      "Cron ingest: 12 importados, 3 eliminados."
    );
    expect(formatCronIngestAlert({ errors: ["football timeout"] })).toBe(
      "Cron ingest: 1 errores."
    );
  });
});
