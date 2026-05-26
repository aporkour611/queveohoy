/** Zonas horarias visibles en la app (eventos almacenados en Europe/Madrid) */

export const TIMEZONE_STORAGE_KEY = "qvh_timezone";

export type RegionId = "es" | "latam";

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
  latamCountry: LatamCountryId;
};

export const DEFAULT_TIMEZONE_PREFS: TimezonePrefs = {
  region: "es",
  latamCountry: "co",
};

export const REGIONS: { id: RegionId; label: string }[] = [
  { id: "es", label: "España" },
  { id: "latam", label: "LATAM" },
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
  if (prefs.region === "es") return "Europe/Madrid";
  const country =
    LATAM_COUNTRIES.find((c) => c.id === prefs.latamCountry) ?? LATAM_COUNTRIES[0];
  return country.timeZone;
}

export function resolveTimeZoneLabel(prefs: TimezonePrefs): string {
  if (prefs.region === "es") return "España (península)";
  const country =
    LATAM_COUNTRIES.find((c) => c.id === prefs.latamCountry) ?? LATAM_COUNTRIES[0];
  return country.label;
}

export function parseTimezonePrefs(raw: unknown): TimezonePrefs {
  if (!raw || typeof raw !== "object") return DEFAULT_TIMEZONE_PREFS;
  const obj = raw as Partial<TimezonePrefs>;
  const region: RegionId = obj.region === "latam" ? "latam" : "es";
  const latamCountry = LATAM_COUNTRIES.some((c) => c.id === obj.latamCountry)
    ? (obj.latamCountry as LatamCountryId)
    : DEFAULT_TIMEZONE_PREFS.latamCountry;
  return { region, latamCountry };
}
