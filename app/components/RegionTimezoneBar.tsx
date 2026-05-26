"use client";

import {
  LATAM_COUNTRIES,
  SPAIN_ZONES,
  useTimezone,
} from "../lib/timezone-context";
import type { LatamCountryId, SpainZoneId } from "../lib/timezone-config";

export function RegionTimezoneBar() {
  const { prefs, setRegion, setSpainZone, setLatamCountry } = useTimezone();

  return (
    <div className="fh-tz-picker" role="region" aria-label="Zona horaria">
      <div className="fh-tz-picker-row">
        <div className="fh-tz-picker-tabs" role="group" aria-label="Región">
          <button
            type="button"
            className={`fh-tz-tab${prefs.region === "es" ? " active" : ""}`}
            aria-pressed={prefs.region === "es"}
            onClick={() => setRegion("es")}
          >
            ES
          </button>
          <button
            type="button"
            className={`fh-tz-tab${prefs.region === "latam" ? " active" : ""}`}
            aria-pressed={prefs.region === "latam"}
            onClick={() => setRegion("latam")}
          >
            LATAM
          </button>
        </div>

        <label className="fh-tz-picker-zone">
          <span className="sr-only">
            {prefs.region === "es" ? "Zona de España" : "País LATAM"}
          </span>
          {prefs.region === "es" ? (
            <select
              value={prefs.spainZone}
              onChange={(e) => setSpainZone(e.target.value as SpainZoneId)}
              aria-label="Zona de España"
            >
              {SPAIN_ZONES.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.label}
                </option>
              ))}
            </select>
          ) : (
            <select
              value={prefs.latamCountry}
              onChange={(e) =>
                setLatamCountry(e.target.value as LatamCountryId)
              }
              aria-label="País y huso horario"
            >
              {LATAM_COUNTRIES.map((country) => (
                <option key={country.id} value={country.id}>
                  {country.label}
                </option>
              ))}
            </select>
          )}
        </label>
      </div>
    </div>
  );
}
