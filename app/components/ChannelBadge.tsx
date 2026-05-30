import { channelStyle } from "../lib/channels";

type BadgeVariant = "match" | "spotlight" | "inline";

type ChannelBadgeProps = {
  name: string;
  variant?: BadgeVariant;
};

export function ChannelBadge({ name, variant = "match" }: ChannelBadgeProps) {
  const style = channelStyle(name);
  const className = `qvh-channel-badge qvh-channel-badge--${style.tier} qvh-channel-badge--${variant}`;
  const inlineStyle = {
    backgroundColor: style.bg,
    color: style.color,
    borderColor: style.border,
  };

  return (
    <span
      className={className}
      style={inlineStyle}
      title={style.tier === "free" ? "Gratis · En abierto" : "De pago"}
    >
      {style.label}
    </span>
  );
}

type ChannelBadgesProps = {
  channels: string[];
  variant?: BadgeVariant;
  prominent?: boolean;
  className?: string;
};

export function ChannelBadges({
  channels,
  variant = "match",
  prominent = false,
  className = "",
}: ChannelBadgesProps) {
  if (!channels.length) return null;

  const wrapClass = [
    "qvh-channel-badges",
    `qvh-channel-badges--${variant}`,
    prominent ? "qvh-channel-badges--prominent" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={wrapClass}>
      {channels.map((ch) => (
        <ChannelBadge key={ch} name={ch} variant={variant} />
      ))}
    </div>
  );
}
