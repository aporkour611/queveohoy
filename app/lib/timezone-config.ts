/** Zonas horarias visibles en la app (eventos almacenados en Europe/Madrid) */

export const TIMEZONE_STORAGE_KEY = "qvh_timezone";

export type RegionId = "es" | "latam";

export type SpainZoneId = "peninsula" | "canarias";

export type LatamCountryId =
  | "co"
  | "mx"
  | "ar"
  | "cl"
  | "pe"
  | "ve"
  | "ec"
  | "uy"
  | "py"
  | "bo"
  | "cr"
  | "pa"
  | "do"
  | "gt";

export type TimezonePrefs = {
  region: RegionId;
  spainZone: SpainZoneId;
  latamCountry: LatamCountryId;
};

export const DEFAULT_TIMEZONE_PREFS: TimezonePrefs = {
  region: "es",
  spainZone: "peninsula",
  latamCountry: "co",
};

export const SPAIN_ZONES: {
  id: SpainZoneId;
  label: string;
  timeZone: string;
}[] = [
  { id: "peninsula", label: "Península", timeZone: "Europe/Madrid" },
  { id: "canarias", label: "Canarias", timeZone: "Atlantic/Canary" },
];

export const LATAM_COUNTRIES: {
  id: LatamCountryId;
  label: string;
  timeZone: string;
}[] = [
  { id: "co", label: "Colombia", timeZone: "America/Bogota" },
  { id: "mx", label: "México (Centro)", timeZone: "America/Mexico_City" },
  { id: "ar", label: "Argentina", timeZone: "America/Argentina/Buenos_Aires" },
  { id: "cl", label: "Chile", timeZone: "America/Santiago" },
  { id: "pe", label: "Perú", timeZone: "America/Lima" },
  { id: "ve", label: "Venezuela", timeZone: "America/Caracas" },
  { id: "ec", label: "Ecuador", timeZone: "America/Guayaquil" },
  { id: "uy", label: "Uruguay", timeZone: "America/Montevideo" },
  { id: "py", label: "Paraguay", timeZone: "America/Asuncion" },
  { id: "bo", label: "Bolivia", timeZone: "America/La_Paz" },
  { id: "cr", label: "Costa Rica", timeZone: "America/Costa_Rica" },
  { id: "pa", label: "Panamá", timeZone: "America/Panama" },
  { id: "do", label: "Rep. Dominicana", timeZone: "America/Santo_Domingo" },
  { id: "gt", label: "Guatemala", timeZone: "America/Guatemala" },
];

export function resolveTimeZone(prefs: TimezonePrefs): string {
  if (prefs.region === "latam") {
    const country =
      LATAM_COUNTRIES.find((c) => c.id === prefs.latamCountry) ?? LATAM_COUNTRIES[0];
    return country.timeZone;
  }

  const zone =
    SPAIN_ZONES.find((z) => z.id === prefs.spainZone) ?? SPAIN_ZONES[0];
  return zone.timeZone;
}

export function resolveTimeZoneLabel(prefs: TimezonePrefs): string {
  if (prefs.region === "latam") {
    const country =
      LATAM_COUNTRIES.find((c) => c.id === prefs.latamCountry) ?? LATAM_COUNTRIES[0];
    return country.label;
  }

  const zone =
    SPAIN_ZONES.find((z) => z.id === prefs.spainZone) ?? SPAIN_ZONES[0];
  return zone.label;
}

export function parseTimezonePrefs(raw: unknown): TimezonePrefs {
  if (!raw || typeof raw !== "object") return DEFAULT_TIMEZONE_PREFS;
  const obj = raw as Partial<TimelinePrefsLike>;
  const region: RegionId = obj.region === "latam" ? "latam" : "es";
  const spainZone = SPAIN_ZONES.some((z) => z.id === obj.spainZone)
    ? (obj.spainZone as SpainZoneId)
    : DEFAULT_TIMEZONE_PREFS.spainZone;
  const latamCountry = LATAM_COUNTRIES.some((c) => c.id === obj.latamCountry)
    ? (obj.latamCountry as LatamCountryId)
    : DEFAULT_TIMEZONE_PREFS.latamCountry;
  return { region, spainZone, latamCountry };
}

type TimelinePrefsLike = TimezonePrefs & { spainZone?: SpainZoneId };
