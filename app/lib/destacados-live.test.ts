import { describe, expect, it } from "vitest";
import type { EventRow } from "../components/types";
import { pickLiveNowDestacados } from "./destacados-config";

describe("pickLiveNowDestacados", () => {
  it("devuelve eventos en directo con canal en abierto", () => {
    const now = new Date("2026-05-27T21:30:00+02:00");
    const events: EventRow[] = [
      {
        id: 1,
        title: "Real Madrid vs Barcelona",
        date: "2026-05-27",
        time: "21:00",
        sport: "futbol",
        platform: "Movistar+, La 1",
      },
      {
        id: 2,
        title: "Partido de pago",
        date: "2026-05-27",
        time: "21:00",
        sport: "futbol",
        platform: "Movistar+",
      },
      {
        id: 3,
        title: "MasterChef",
        date: "2026-05-27",
        time: "22:50",
        sport: "tv",
        platform: "La 1",
      },
    ];

    const live = pickLiveNowDestacados(events, {
      now,
      todayKey: "2026-05-27",
    });

    expect(live.map((event) => event.id)).toEqual([1]);
  });

  it("vacío si no hay emisiones en directo ahora", () => {
    const now = new Date("2026-05-27T18:00:00+02:00");
    const events: EventRow[] = [
      {
        id: 1,
        title: "Real Madrid vs Barcelona",
        date: "2026-05-27",
        time: "21:00",
        sport: "futbol",
        platform: "La 1",
      },
    ];

    expect(
      pickLiveNowDestacados(events, { now, todayKey: "2026-05-27" })
    ).toEqual([]);
  });
});
