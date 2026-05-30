type Props = {
  eyebrow: string;
  title: string;
  lead?: string;
  variant: "tv" | "sports";
};

export function FeedSectionHero({ eyebrow, title, lead, variant }: Props) {
  const prefix = variant === "tv" ? "qvh-tv" : "qvh-sports";

  return (
    <header className={`${prefix}-hero`}>
      <div className={`${prefix}-hero-glow`} aria-hidden />
      <p className={`${prefix}-hero-eyebrow`}>
        <span className={`${prefix}-hero-dot`} aria-hidden />
        {eyebrow}
      </p>
      <h3 className={`${prefix}-hero-title`}>{title}</h3>
      {lead ? <p className={`${prefix}-hero-lead`}>{lead}</p> : null}
    </header>
  );
}
