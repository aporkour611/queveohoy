"use client";

import Link from "next/link";
import { ChannelBadge } from "./ChannelBadge";
import { Logo } from "./Logo";
import { SiteFooter } from "./SiteFooter";
import type { LivePlayerEmbed } from "../lib/live-player";
import { LiveEmbedPlayer } from "./LiveEmbedPlayer";

type Props = {
  channel: string;
  player: LivePlayerEmbed;
};

export function ChannelWatchPage({ channel, player }: Props) {
  return (
    <div className="fh-body fh-live-page fh-channel-watch">
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
          <header className="fh-live-header fh-channel-watch-header">
            <h1 className="fh-live-title">{channel}</h1>
            <ChannelBadge name={channel} variant="inline" broadcasting linked={false} />
          </header>

          <div className="fh-live-stage">
            <LiveEmbedPlayer player={player} channel={channel} />
          </div>

          <p className="fh-seo-hub-cta">
            <Link href="/">Ver toda la agenda →</Link>
          </p>

          <SiteFooter />
        </div>
      </main>
    </div>
  );
}
