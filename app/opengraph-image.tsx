import { ImageResponse } from "next/og";
import { fetchFeedEvents } from "./lib/events-feed-server";
import { buildHomeMetadataTitle } from "./lib/seo-jsonld";
import { countTodayStats } from "./lib/home-stats";
import {
  filterEventsInWeek,
  mapEventsToTimezone,
  MADRID_TZ,
} from "./lib/timezone";

export const alt = "Qué veo hoy — agenda TV y partidos";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const { events } = await fetchFeedEvents();
  const madridEvents = mapEventsToTimezone(events, MADRID_TZ);
  const stats = countTodayStats(madridEvents, MADRID_TZ);
  const title = buildHomeMetadataTitle();
  const today = filterEventsInWeek(madridEvents, MADRID_TZ, 1);
  const sample = today
    .slice(0, 2)
    .map((e) =>
      e.home_team && e.away_team
        ? `${e.home_team} vs ${e.away_team}`
        : e.title
    )
    .filter(Boolean)
    .join(" · ");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 56,
          background: "linear-gradient(145deg, #0a0a0f 0%, #1a1033 55%, #2d1b4e 100%)",
          color: "#fff",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ fontSize: 28, opacity: 0.85 }}>queveohoy.es</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 52, fontWeight: 800, lineHeight: 1.1, maxWidth: 1000 }}>
            {title}
          </div>
          <div style={{ fontSize: 30, color: "#c4b5fd" }}>
            {stats.total > 0
              ? `${stats.total} eventos hoy · horarios y canales`
              : "Partidos, Champions, LaLiga, F1 y más"}
          </div>
          {sample ? (
            <div style={{ fontSize: 24, opacity: 0.9, maxWidth: 1000 }}>{sample}</div>
          ) : null}
        </div>
        <div style={{ fontSize: 22, opacity: 0.7 }}>España · TV y streaming</div>
      </div>
    ),
    { ...size }
  );
}
