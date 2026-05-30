import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { getFeedEventsForPage } from "../../lib/events-feed-server";
import {
  filterEventsForHub,
  getSeoHub,
} from "../../lib/seo-hubs";

export const alt = "Agenda TV y horarios";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = {
  params: Promise<{ hub: string }>;
};

export default async function Image({ params }: Props) {
  const { hub: slug } = await params;
  const hub = getSeoHub(slug);
  if (!hub) notFound();

  const { events } = await getFeedEventsForPage();
  const filtered = filterEventsForHub(events, hub);
  const count = filtered.length;
  const scopeLabel = hub.dayScope === "today" ? "hoy" : "esta semana";

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
          background:
            "linear-gradient(145deg, #0a0a0f 0%, #1a1033 55%, #2d1b4e 100%)",
          color: "#fff",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ fontSize: 28, opacity: 0.85 }}>queveohoy.es</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              fontSize: 52,
              fontWeight: 800,
              lineHeight: 1.1,
              maxWidth: 1000,
            }}
          >
            {hub.h1}
          </div>
          <div style={{ fontSize: 30, color: "#c4b5fd" }}>
            {count > 0
              ? `${count} evento${count === 1 ? "" : "s"} ${scopeLabel} · horarios y canales`
              : "Horarios y canales en TV y streaming"}
          </div>
          <div style={{ fontSize: 24, opacity: 0.9, maxWidth: 1000 }}>
            {hub.lead}
          </div>
        </div>
        <div style={{ fontSize: 22, opacity: 0.7 }}>España · TV y streaming</div>
      </div>
    ),
    { ...size }
  );
}
