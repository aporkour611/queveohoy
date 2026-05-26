"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { teamInitials } from "../lib/football";

type Props = {
  src?: string | null;
  srcList?: string[];
  name?: string | null;
  size?: number;
  className?: string;
};

function crestSrc(src: string, attempt: number): string {
  if (attempt === 0) return src;
  const sep = src.includes("?") ? "&" : "?";
  return `${src}${sep}_r=${attempt}`;
}

export function TeamCrest({
  src,
  srcList,
  name,
  size = 50,
  className,
}: Props) {
  const urls = useMemo(() => {
    const list = srcList?.length ? srcList : src ? [src] : [];
    return [...new Set(list.map((u) => u.replace(/^http:\/\//i, "https://")))];
  }, [src, srcList]);

  const [urlIndex, setUrlIndex] = useState(0);
  const [retry, setRetry] = useState(0);
  const [failed, setFailed] = useState(false);

  const initials = teamInitials(name);
  const hue =
    (name?.split("").reduce((a, c) => a + c.charCodeAt(0), 0) ?? 0) % 360;

  const currentUrl = urls[urlIndex];
  const showPlaceholder = !currentUrl || failed;
  const wrapperClass = ["fh-team-crest", className].filter(Boolean).join(" ");

  function handleError() {
    if (retry + 1 < 2) {
      setRetry((n) => n + 1);
      return;
    }

    if (urlIndex + 1 < urls.length) {
      setUrlIndex((n) => n + 1);
      setRetry(0);
      return;
    }

    setFailed(true);
  }

  return (
    <div
      className={wrapperClass}
      style={{ width: size, height: size }}
      title={name ?? undefined}
    >
      {showPlaceholder ? (
        <div
          className="fh-team-crest-placeholder"
          style={{
            background: `linear-gradient(135deg, hsl(${hue}, 55%, 42%), hsl(${hue}, 60%, 28%))`,
            fontSize: size * 0.32,
          }}
        >
          {initials}
        </div>
      ) : (
        <Image
          key={`${urlIndex}-${retry}`}
          src={crestSrc(currentUrl, retry)}
          alt=""
          width={size}
          height={size}
          className="fh-team-crest-img"
          sizes={`${size}px`}
          loading="lazy"
          onError={handleError}
        />
      )}
    </div>
  );
}
