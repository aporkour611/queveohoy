"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_TIMEZONE_PREFS,
  LATAM_COUNTRIES,
  parseTimezonePrefs,
  resolveTimeZone,
  resolveTimeZoneLabel,
  SPAIN_ZONES,
  TIMEZONE_STORAGE_KEY,
  type LatamCountryId,
  type RegionId,
  type SpainZoneId,
  type TimezonePrefs,
} from "./timezone-config";

type TimezoneContextValue = {
  prefs: TimezonePrefs;
  timeZone: string;
  timeZoneLabel: string;
  setRegion: (region: RegionId) => void;
  setSpainZone: (zone: SpainZoneId) => void;
  setLatamCountry: (country: LatamCountryId) => void;
};

const TimezoneContext = createContext<TimezoneContextValue | null>(null);

export function TimezoneProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<TimezonePrefs>(DEFAULT_TIMEZONE_PREFS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(TIMEZONE_STORAGE_KEY);
      if (saved) setPrefs(parseTimezonePrefs(JSON.parse(saved)));
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(TIMEZONE_STORAGE_KEY, JSON.stringify(prefs));
    } catch {}
  }, [prefs, ready]);

  const setRegion = useCallback((region: RegionId) => {
    setPrefs((prev) => ({ ...prev, region }));
  }, []);

  const setSpainZone = useCallback((spainZone: SpainZoneId) => {
    setPrefs((prev) => ({ ...prev, spainZone, region: "es" }));
  }, []);

  const setLatamCountry = useCallback((latamCountry: LatamCountryId) => {
    setPrefs((prev) => ({ ...prev, latamCountry, region: "latam" }));
  }, []);

  const value = useMemo(
    () => ({
      prefs,
      timeZone: resolveTimeZone(prefs),
      timeZoneLabel: resolveTimeZoneLabel(prefs),
      setRegion,
      setSpainZone,
      setLatamCountry,
    }),
    [prefs, setRegion, setSpainZone, setLatamCountry]
  );

  return (
    <TimezoneContext.Provider value={value}>{children}</TimezoneContext.Provider>
  );
}

export function useTimezone() {
  const ctx = useContext(TimezoneContext);
  if (!ctx) {
    throw new Error("useTimezone debe usarse dentro de TimezoneProvider");
  }
  return ctx;
}

export { LATAM_COUNTRIES, SPAIN_ZONES };
