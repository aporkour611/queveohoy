import type { FeedSectionHeroVariant } from "../lib/feed-panel-config";

type Props = {
  eyebrow: string;
  title: string;
  lead?: string;
  variant: FeedSectionHeroVariant;
};

const PREFIX: Record<FeedSectionHeroVariant, string> = {
  tv: "qvh-feed-hero qvh-feed-hero-tv",
  sports: "qvh-feed-hero qvh-feed-hero-sports",
  esports: "qvh-feed-hero qvh-feed-hero-esports",
  motor: "qvh-feed-hero qvh-feed-hero-motor",
  catalog: "qvh-feed-hero qvh-feed-hero-catalog",
};

export function FeedSectionHero({ eyebrow, title, lead, variant }: Props) {
  const rootClass = PREFIX[variant];

  return (
    <header className={rootClass}>
      <div className="qvh-feed-hero-glow" aria-hidden />
      <p className="qvh-feed-hero-eyebrow">
        <span className="qvh-feed-hero-dot" aria-hidden />
        {eyebrow}
      </p>
      <h3 className="qvh-feed-hero-title">{title}</h3>
      {lead ? <p className="qvh-feed-hero-lead">{lead}</p> : null}
    </header>
  );
}

export type { FeedSectionHeroVariant };
