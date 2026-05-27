import { pickWeekDestacados, pickTodayDestacados } from "../app/lib/destacados-config.ts";
import { toMadridDateKey } from "../app/lib/madrid-time.ts";

const todayKey = toMadridDateKey(new Date());
console.log("todayKey", todayKey);

// Simula muchos eventos esta semana antes del 29
const filler = Array.from({ length: 20 }, (_, i) => ({
  id: 1000 + i,
  title: `Evento ${i}`,
  date: todayKey,
  time: `${10 + i}:00`,
  sport: "futbol",
  competition: "LaLiga",
}));

const today = pickTodayDestacados(filler, { todayKey });
const week = pickWeekDestacados(filler, {
  todayKey,
  excludeIds: new Set(today.map((e) => e.id)),
});

console.log(
  "week titles:",
  week.map((e) => `${e.title} (${e.date})`)
);
console.log(
  "has el drama:",
  week.some((e) => e.external_id === "tmdb_movie_1325734")
);
