import Link from "next/link";
import type { EventRow } from "./types";
import { MatchCard } from "./MatchCard";
import { PageMain } from "./PageMain";
import { SiteFooter } from "./SiteFooter";
import { Logo } from "./Logo";
import { UfcFightVisual } from "./UfcFightVisual";
import { eventLabel } from "../lib/seo-events";
import { buildEventDetails } from "../lib/event-details";
import { displayTime } from "../lib/madrid-time";
import { ChannelBadges } from "./ChannelBadge";
import { resolveChannelsForEvent } from "../lib/channels";
import { formatDisplayDateLabel, MADRID_TZ } from "../lib/timezone";
import {
  parseUfcFighterImages,
  parseUfcMainEventFighters,
  parseUfcKindFromSource,
  ufcKindLabel,
} from "../lib/thesportsdb-ufc-client";
import {
  isTopuriaGaethjeFight,
  UFC_CASABLANCA_FIGHTER_IMAGES,
} from "../lib/ufc-week";

type Props = {
  event: EventRow;
};

function PartidoDetailsList({ event }: { event: EventRow }) {
  const details = buildEventDetails(event);
  const watchChannels = resolveChannelsForEvent(event);

  if (!details.length) return null;

  return (
    <dl className="fh-partido-details">
      {details.map(({ label, value }) => (
        <div key={label} className="fh-partido-detail-row">
          <dt>{label}</dt>
          {label === "Dónde ver" && watchChannels.length > 0 ? (
            <dd>
              <ChannelBadges channels={watchChannels} variant="inline" />
            </dd>
          ) : (
            <dd>{value}</dd>
          )}
        </div>
      ))}
    </dl>
  );
}

function PartidoUfcHero({ event }: { event: EventRow }) {
  const { f1, f2 } = parseUfcFighterImages(event.source);
  const matchup = parseUfcMainEventFighters(event.competition, event.title);
  const f1Name = event.home_team || matchup?.n1 || "Luchador 1";
  const f2Name = event.away_team || matchup?.n2 || "Luchador 2";
  const editorial = isTopuriaGaethjeFight(event);
  const f1Url = f1 ?? (editorial ? UFC_CASABLANCA_FIGHTER_IMAGES.topuria : null);
  const f2Url = f2 ?? (editorial ? UFC_CASABLANCA_FIGHTER_IMAGES.gaethje : null);
  const kind = parseUfcKindFromSource(event.source);
  const cardLine = event.competition?.trim();

  return (
    <section className="fh-partido-ufc-hero" aria-label="Cartel del combate">
      <div className="fh-partido-ufc-hero-bg" aria-hidden />
      <p className="fh-partido-ufc-kicker">
        {editorial ? "UFC Casablanca · Freedom 250" : ufcKindLabel(kind)}
      </p>
      <h2 className="fh-partido-ufc-title">{event.title?.trim() || "UFC"}</h2>
      {cardLine && cardLine !== ufcKindLabel(kind) ? (
        <p className="fh-partido-ufc-meta">{cardLine}</p>
      ) : null}
      <UfcFightVisual
        f1Url={f1Url}
        f2Url={f2Url}
        f1Name={f1Name}
        f2Name={f2Name}
        size="spotlight"
        eager
      />
    </section>
  );
}

export function PartidoPage({ event }: Props) {
  const channels = resolveChannelsForEvent(event);
  const dateLabel = event.date
    ? formatDisplayDateLabel(event.date, MADRID_TZ)
    : "";
  const isUfc = event.sport === "ufc";

  return (
    <div className="fh-body">
      <nav className="fh-navbar">
        <div className="fh-navbar-inner">
          <Logo />
          <div className="fh-nav-links">
            <Link href="/" className="fh-seo-hub-back">
              Agenda completa
            </Link>
          </div>
        </div>
      </nav>

      <PageMain className="fh-content">
        <div
          className={`fh-container fh-main fh-partido-page${
            isUfc ? " fh-partido-page-ufc" : ""
          }`}
        >
          <nav className="fh-seo-breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Inicio</Link>
            <span aria-hidden>›</span>
            <span aria-current="page">{eventLabel(event)}</span>
          </nav>

          <h1 className="fh-page-title">{eventLabel(event)}</h1>
          <p className="fh-page-lead">
            {[
              event.competition?.split(" · ")[0],
              dateLabel,
              event.time ? displayTime(event.time) : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
          {channels.length > 0 ? (
            <ChannelBadges
              channels={channels}
              variant="inline"
              className="fh-page-lead-channels"
            />
          ) : null}

          {isUfc ? <PartidoUfcHero event={event} /> : null}

          <PartidoDetailsList event={event} />

          <div className="fh-partido-card-wrap">
            <MatchCard event={event} />
          </div>

          <p className="fh-seo-hub-cta">
            <Link href="/" className="fh-btn fh-btn-primary">
              Ver toda la agenda
            </Link>
          </p>
        </div>
        <SiteFooter />
      </PageMain>
    </div>
  );
}
