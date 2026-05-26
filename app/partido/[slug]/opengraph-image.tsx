import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { resolveChannelsForEvent } from "../../lib/channels";
import { fetchFeedEvents } from "../../lib/events-feed-server";
import { findEventBySlug } from "../../lib/event-slug";
import { displayTime } from "../../lib/madrid-time";
import { eventLabel } from "../../lib/seo-events";

export const alt = "Horario y canal del partido";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function Image({ params }: Props) {
  const { slug } = await params;
  const { events } = await fetchFeedEvents();
  const event = findEventBySlug(events, slug);
  if (!event) notFound();

  const label = eventLabel(event);
  const time = event.time ? displayTime(event.time) : "";
  const channel = resolveChannelsForEvent(event)[0] ?? "";
  const competition = event.competition?.split(" · ")[0] ?? "";

  const subtitle = [competition, time, channel].filter(Boolean).join(" · ");

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
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: label.length > 40 ? 44 : 52,
              fontWeight: 800,
              lineHeight: 1.1,
              maxWidth: 1050,
            }}
          >
            {label}
          </div>
          {subtitle ? (
            <div style={{ fontSize: 30, color: "#c4b5fd" }}>{subtitle}</div>
          ) : null}
          <div style={{ fontSize: 24, opacity: 0.85 }}>
            Horario y canal en TV · España
          </div>
        </div>
        <div style={{ fontSize: 22, opacity: 0.7 }}>Qué veo hoy</div>
      </div>
    ),
    { ...size }
  );
}
