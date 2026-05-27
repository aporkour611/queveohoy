"use client";

import { useState } from "react";
import { safeRemoteImageUrl } from "../lib/remote-image";
import { useLazyInView } from "../lib/use-lazy-in-view";

type Props = {
  f1Url?: string | null;
  f2Url?: string | null;
  f1Name?: string | null;
  f2Name?: string | null;
  className?: string;
  size?: "card" | "spotlight";
  eager?: boolean;
};

function FighterImage({
  url,
  name,
  imgClass,
  eager,
}: {
  url?: string | null;
  name?: string | null;
  imgClass: string;
  eager?: boolean;
}) {
  const safeUrl = safeRemoteImageUrl(url);
  const [failed, setFailed] = useState(false);
  const { ref, inView } = useLazyInView({
    eager,
    rootMargin: "180px 0px",
  });

  if (!safeUrl || failed) {
    return <span className="fh-ufc-fighter-fallback">{initials(name)}</span>;
  }

  const shouldLoad = eager || inView;

  return (
    <div ref={ref} className="fh-ufc-fighter-slot">
      {shouldLoad ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={safeUrl}
          alt=""
          width={120}
          height={120}
          className={imgClass}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="fh-ufc-fighter-fallback">{initials(name)}</span>
      )}
    </div>
  );
}

export function UfcFightVisual({
  f1Url,
  f2Url,
  f1Name,
  f2Name,
  className,
  size = "card",
  eager = false,
}: Props) {
  const rootClass = [
    size === "spotlight" ? "qvh-ufc-duel" : "fh-ufc-duel",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  const imgClass = size === "spotlight" ? "qvh-ufc-fighter-img" : "fh-ufc-fighter-img";

  if (
    !safeRemoteImageUrl(f1Url) &&
    !safeRemoteImageUrl(f2Url) &&
    !f1Name?.trim() &&
    !f2Name?.trim()
  ) {
    return null;
  }

  return (
    <div className={rootClass} aria-hidden>
      <div className={size === "spotlight" ? "qvh-ufc-fighter" : "fh-ufc-fighter"}>
        <FighterImage
          url={f1Url}
          name={f1Name}
          imgClass={imgClass}
          eager={eager}
        />
      </div>
      <span className={size === "spotlight" ? "qvh-ufc-vs" : "fh-ufc-vs"}>vs</span>
      <div className={size === "spotlight" ? "qvh-ufc-fighter" : "fh-ufc-fighter"}>
        <FighterImage
          url={f2Url}
          name={f2Name}
          imgClass={imgClass}
          eager={eager}
        />
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
