"use client";

import { useState } from "react";
import { teamInitials } from "../lib/football";

type Props = {
  src?: string | null;
  name?: string | null;
  size?: number;
  className?: string;
};

export function TeamCrest({ src, name, size = 50, className }: Props) {
  const [failed, setFailed] = useState(false);
  const initials = teamInitials(name);
  const hue =
    (name?.split("").reduce((a, c) => a + c.charCodeAt(0), 0) ?? 0) % 360;

  if (!src || failed) {
    return (
      <div
        className={className}
        style={{
          width: size,
          height: size,
          borderRadius: 4,
          background: `linear-gradient(135deg, hsl(${hue}, 55%, 42%), hsl(${hue}, 60%, 28%))`,
          color: "#fff",
          fontSize: size * 0.32,
          fontWeight: 800,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
        }}
        title={name ?? undefined}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      className={className}
      onError={() => setFailed(true)}
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        flexShrink: 0,
      }}
    />
  );
}
