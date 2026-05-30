export type CronIngestSummary = {
  inserted?: number;
  updated?: number;
  purged?: number;
  errors?: string[];
};

export type CronHealthAlert = {
  title: string;
  details: Record<string, unknown>;
  level?: "warning" | "error";
};

export type CronHealthInput = {
  football?: { count?: number; errors?: string[] };
  esportsError?: string;
  f1Error?: string;
  motosError?: string;
  tenisCiclismoError?: string;
  basketError?: string;
  tmdbError?: string;
  animeError?: string;
  realityError?: string;
  spanishTvError?: string;
  ufcError?: string;
  dedupeError?: string;
  pastDayPurgeError?: string;
  crestEnrichError?: string;
  blockedSportsPurgeError?: string;
  hint?: string;
};

/** Mensaje compacto para logs o alertas tras una ejecución de cron. */
export function formatCronIngestAlert(summary: CronIngestSummary): string {
  const parts: string[] = [];

  if (summary.inserted != null && summary.inserted > 0) {
    parts.push(`${summary.inserted} importados`);
  }
  if (summary.updated != null && summary.updated > 0) {
    parts.push(`${summary.updated} actualizados`);
  }
  if (summary.purged != null && summary.purged > 0) {
    parts.push(`${summary.purged} eliminados`);
  }
  if (summary.errors?.length) {
    parts.push(`${summary.errors.length} errores`);
  }

  if (parts.length === 0) {
    return "Cron ingest: sin cambios.";
  }

  return `Cron ingest: ${parts.join(", ")}.`;
}

const INGEST_ERROR_FIELDS: Array<keyof CronHealthInput> = [
  "esportsError",
  "f1Error",
  "motosError",
  "tenisCiclismoError",
  "basketError",
  "tmdbError",
  "animeError",
  "realityError",
  "spanishTvError",
  "ufcError",
  "dedupeError",
  "pastDayPurgeError",
  "crestEnrichError",
  "blockedSportsPurgeError",
];

export function evaluateCronHealth(result: CronHealthInput): CronHealthAlert[] {
  const alerts: CronHealthAlert[] = [];

  if (result.football?.count === 0) {
    alerts.push({
      title: "Cron: 0 partidos de fútbol importados",
      level: "warning",
      details: {
        footballErrors: result.football.errors ?? [],
        hint: result.hint,
      },
    });
  }

  if (result.football?.errors?.length) {
    alerts.push({
      title: "Cron: errores en ingestión de fútbol",
      level: "error",
      details: { errors: result.football.errors },
    });
  }

  for (const field of INGEST_ERROR_FIELDS) {
    const message = result[field];
    if (typeof message === "string" && message.trim()) {
      alerts.push({
        title: `Cron: error en ${field}`,
        level: "error",
        details: { field, message },
      });
    }
  }

  return alerts;
}

export async function sendCronAlert(payload: CronHealthAlert): Promise<void> {
  const webhookUrl = process.env.CRON_ALERT_WEBHOOK_URL?.trim();
  if (!webhookUrl) return;

  const level = payload.level ?? "warning";
  const detailLines = Object.entries(payload.details)
    .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
    .join("\n");

  const text = `[queveohoy cron · ${level}] ${payload.title}${detailLines ? `\n${detailLines}` : ""}`;

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
  } catch (error) {
    console.warn("Cron alert webhook failed:", error);
  }
}
