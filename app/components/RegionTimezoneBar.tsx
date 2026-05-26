"use client";

import { LATAM_COUNTRIES, useTimezone } from "../lib/timezone-context";
import type { LatamCountryId } from "../lib/timezone-config";

export function RegionTimezoneBar() {
  const { prefs, timeZoneLabel, setRegion, setLatamCountry } = useTimezone();

  return (
    <div className="fh-tz-bar" role="region" aria-label="Zona horaria">
      <div className="fh-tz-bar-inner">
        <span className="fh-tz-bar-label">Horario</span>

        <div className="fh-tz-region-toggle" role="group" aria-label="Región">
          <button
            type="button"
            className={`fh-tz-region-btn${prefs.region === "es" ? " active" : ""}`}
            aria-pressed={prefs.region === "es"}
            onClick={() => setRegion("es")}
          >
            España
          </button>
          <button
            type="button"
            className={`fh-tz-region-btn${prefs.region === "latam" ? " active" : ""}`}
            aria-pressed={prefs.region === "latam"}
            onClick={() => setRegion("latam")}
          >
            LATAM
          </button>
        </div>

        {prefs.region === "latam" ? (
          <label className="fh-tz-country">
            <span className="sr-only">País y huso horario</span>
            <select
              value={prefs.latamCountry}
              onChange={(e) => setLatamCountry(e.target.value as LatamCountryId)}
              aria-label="País y huso horario"
            >
              {LATAM_COUNTRIES.map((country) => (
                <option key={country.id} value={country.id}>
                  {country.label}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <span className="fh-tz-current">{timeZoneLabel}</span>
        )}

        {prefs.region === "latam" ? (
          <span className="fh-tz-current fh-tz-current-compact">{timeZoneLabel}</span>
        ) : null}
      </div>
    </div>
  );
}
