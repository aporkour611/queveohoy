import { describe, expect, it } from "vitest";
import type { EventRow } from "../components/types";
import {
  getFreeLiveBroadcast,
  isEventLiveNow,
  isFreeLiveChannel,
} from "./event-live";

const baseEvent: EventRow = {
  id: 1,
  title: "Real Madrid vs Barcelona",
  date: "2026-05-27",
  time: "21:00",
  sport: "futbol",
  competition: "LaLiga",
  platform: "Movistar+, La 1",
};

describe("isFreeLiveChannel", () => {
  it("incluye RTVE, La 1, Antena 3 y Twitch", () => {
    expect(isFreeLiveChannel("La 1")).toBe(true);
    expect(isFreeLiveChannel("RTVE Play")).toBe(true);
    expect(isFreeLiveChannel("Antena 3")).toBe(true);
    expect(isFreeLiveChannel("ATRESPLAYER TV")).toBe(true);
    expect(isFreeLiveChannel("Telecinco")).toBe(true);
    expect(isFreeLiveChannel("Twitch · Ibai")).toBe(true);
    expect(isFreeLiveChannel("Movistar+")).toBe(false);
  });
});

describe("isEventLiveNow", () => {
  it("detecta evento en franja horaria de hoy", () => {
    const now = new Date("2026-05-27T21:30:00+02:00");
    expect(isEventLiveNow(baseEvent, now)).toBe(true);
  });

  it("no marca evento de otro día", () => {
    const now = new Date("2026-05-27T20:30:00+02:00");
    expect(isEventLiveNow({ ...baseEvent, date: "2026-05-28" }, now)).toBe(false);
  });
});

describe("getFreeLiveBroadcast", () => {
  it("devuelve solo canal en abierto si está en directo", () => {
    const now = new Date("2026-05-27T21:30:00+02:00");
    const live = getFreeLiveBroadcast(baseEvent, now);

    expect(live?.channel).toBe("La 1");
    expect(live?.watchUrl).toContain("rtve.es");
  });

  it("no devuelve nada si solo hay canales de pago", () => {
    const now = new Date("2026-05-27T21:30:00+02:00");
    const live = getFreeLiveBroadcast(
      { ...baseEvent, platform: "Movistar+, DAZN" },
      now
    );

    expect(live).toBeNull();
  });
});
