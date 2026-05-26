import Image from "next/image";
import { safeRemoteImageUrl } from "../lib/remote-image";

type Props = {
  f1Url?: string | null;
  f2Url?: string | null;
  f1Name?: string | null;
  f2Name?: string | null;
  className?: string;
  size?: "card" | "spotlight";
};

export function UfcFightVisual({
  f1Url,
  f2Url,
  f1Name,
  f2Name,
  className,
  size = "card",
}: Props) {
  const rootClass = [
    size === "spotlight" ? "qvh-ufc-duel" : "fh-ufc-duel",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  const imgClass = size === "spotlight" ? "qvh-ufc-fighter-img" : "fh-ufc-fighter-img";

  const f1Safe = safeRemoteImageUrl(f1Url);
  const f2Safe = safeRemoteImageUrl(f2Url);

  if (!f1Safe && !f2Safe && !f1Name?.trim() && !f2Name?.trim()) return null;

  return (
    <div className={rootClass} aria-hidden>
      <div className={size === "spotlight" ? "qvh-ufc-fighter" : "fh-ufc-fighter"}>
        {f1Safe ? (
          <Image
            src={f1Safe}
            alt=""
            width={120}
            height={120}
            className={imgClass}
            loading="lazy"
            sizes="120px"
            quality={60}
          />
        ) : (
          <span className="fh-ufc-fighter-fallback">{initials(f1Name)}</span>
        )}
      </div>
      <span className={size === "spotlight" ? "qvh-ufc-vs" : "fh-ufc-vs"}>vs</span>
      <div className={size === "spotlight" ? "qvh-ufc-fighter" : "fh-ufc-fighter"}>
        {f2Safe ? (
          <Image
            src={f2Safe}
            alt=""
            width={120}
            height={120}
            className={imgClass}
            loading="lazy"
            sizes="120px"
            quality={60}
          />
        ) : (
          <span className="fh-ufc-fighter-fallback">{initials(f2Name)}</span>
        )}
      </div>
    </div>
  );
}

function initials(name?: string | null): string {
  if (!name?.trim()) return "?";
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    : name.slice(0, 2).toUpperCase();
}
