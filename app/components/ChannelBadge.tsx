import { channelStyle } from "../lib/channels";

type BadgeVariant = "match" | "spotlight" | "inline";

type ChannelBadgeProps = {
  name: string;
  variant?: BadgeVariant;
  broadcasting?: boolean;
};

export function ChannelBadge({
  name,
  variant = "match",
  broadcasting = false,
}: ChannelBadgeProps) {
  const style = channelStyle(name);

  return (
    <span
      className={`qvh-channel-badge qvh-channel-badge--${style.tier} qvh-channel-badge--${variant}${
        broadcasting ? " qvh-channel-badge--broadcasting" : ""
      }`}
      style={{
        backgroundColor: style.bg,
        color: style.color,
        borderColor: style.border,
      }}
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
  liveChannel?: string | null;
};

export function ChannelBadges({
  channels,
  variant = "match",
  prominent = false,
  className = "",
  liveChannel = null,
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
        <ChannelBadge
          key={ch}
          name={ch}
          variant={variant}
          broadcasting={Boolean(liveChannel && ch === liveChannel)}
        />
      ))}
    </div>
  );
}
