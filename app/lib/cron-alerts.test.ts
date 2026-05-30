import { describe, expect, it } from "vitest";
import {
  evaluateCronHealth,
  formatCronIngestAlert,
} from "./cron-alerts";

describe("formatCronIngestAlert", () => {
  it("resume importación con contadores positivos", () => {
    expect(
      formatCronIngestAlert({ inserted: 5, updated: 2, purged: 1 })
    ).toBe("Cron ingest: 5 importados, 2 actualizados, 1 eliminados.");
  });

  it("ignora contadores en cero", () => {
    expect(formatCronIngestAlert({ inserted: 0, updated: 0 })).toBe(
      "Cron ingest: sin cambios."
    );
  });

  it("incluye errores en el mensaje", () => {
    expect(
      formatCronIngestAlert({
        inserted: 1,
        errors: ["pandascore 429", "tmdb timeout"],
      })
    ).toBe("Cron ingest: 1 importados, 2 errores.");
  });
});

describe("evaluateCronHealth", () => {
  it("alerta cuando no hay partidos de fútbol", () => {
    const alerts = evaluateCronHealth({ football: { count: 0, errors: [] } });
    expect(alerts.some((a) => a.title.includes("0 partidos"))).toBe(true);
  });

  it("alerta errores de ingestión", () => {
    const alerts = evaluateCronHealth({ tmdbError: "timeout" });
    expect(alerts.some((a) => a.details.field === "tmdbError")).toBe(true);
  });
});
