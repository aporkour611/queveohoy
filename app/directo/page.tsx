import type { Metadata } from "next";
import Link from "next/link";
import { ChannelBadge } from "../components/ChannelBadge";
import { Logo } from "../components/Logo";
import { SiteFooter } from "../components/SiteFooter";
import { channelWatchPath } from "../lib/channel-slug";
import { FREE_LIVE_CHANNEL_NAMES } from "../lib/live-player";
import { pageMetadata } from "../lib/seo";

export const revalidate = 3600;

export const metadata: Metadata = pageMetadata(
  "/directo",
  "TV en directo gratis",
  "Retransmisiones en abierto y streaming gratuito: RTVE, Antena 3, Telecinco, Twitch y más."
);

export default function DirectoHubPage() {
  return (
    <div className="fh-body fh-live-page fh-directo-hub">
      <nav className="fh-navbar">
        <div className="fh-navbar-inner">
          <Logo />
          <div className="fh-nav-links">
            <Link href="/" className="fh-seo-hub-back">
              Volver a la agenda
            </Link>
          </div>
        </div>
      </nav>

      <main className="fh-content fh-live-main">
        <div className="fh-container fh-live-container">
          <header className="fh-live-header">
            <h1 className="fh-live-title">TV en directo gratis</h1>
            <p className="fh-directo-hub-lead">
              Elige un canal para ver la retransmisión incrustada en Que Veo Hoy
              cuando el emisor lo permite.
            </p>
          </header>

          <ul className="fh-directo-hub-grid">
            {FREE_LIVE_CHANNEL_NAMES.map((name) => (
              <li key={name}>
                <Link
                  href={channelWatchPath(name)}
                  className="fh-directo-hub-card"
                >
                  <ChannelBadge
                    name={name}
                    variant="spotlight"
                    linked={false}
                  />
                  <span className="fh-directo-hub-card-label">Ver en directo</span>
                </Link>
              </li>
            ))}
          </ul>

          <p className="fh-directo-hub-note">
            Telecinco y Cuatro (Mediaset) no permiten incrustar el vídeo en otras
            webs; desde su ficha te llevamos a Mediaset Infinity.
          </p>

          <p className="fh-seo-hub-cta">
            <Link href="/">Ver toda la agenda →</Link>
          </p>

          <SiteFooter />
        </div>
      </main>
    </div>
  );
}
