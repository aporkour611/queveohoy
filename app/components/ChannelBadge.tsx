import Link from "next/link";
import { channelStyle } from "../lib/channels";
import { channelWatchPath } from "../lib/channel-slug";

type BadgeVariant = "match" | "spotlight" | "inline";

type ChannelBadgeProps = {
  name: string;
  variant?: BadgeVariant;
  broadcasting?: boolean;
  /** Si false, muestra el puntito pero no enlaza (p. ej. ya en /directo). */
  linked?: boolean;
};

export function ChannelBadge({
  name,
  variant = "match",
  broadcasting = false,
  linked = true,
}: ChannelBadgeProps) {
  const style = channelStyle(name);
  const className = `qvh-channel-badge qvh-channel-badge--${style.tier} qvh-channel-badge--${variant}${
    broadcasting ? " qvh-channel-badge--broadcasting" : ""
  }`;
  const inlineStyle = {
    backgroundColor: style.bg,
    color: style.color,
    borderColor: style.border,
  };

  if (broadcasting && linked) {
    return (
      <Link
        href={channelWatchPath(name)}
        className={`${className} qvh-channel-badge--watch`}
        style={inlineStyle}
        title={`Ver en ${name}`}
        aria-label={`Ver retransmisión en ${name}`}
        onClick={(clickEvent) => clickEvent.stopPropagation()}
      >
        {style.label}
      </Link>
    );
  }

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
