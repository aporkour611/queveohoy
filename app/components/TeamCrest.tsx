"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { teamInitials } from "../lib/football";
import {
  canOptimizeImageSrc,
  IMAGE_QUALITY,
  POSTER_SIZES,
} from "../lib/optimized-image";
import { normalizeRemoteImageUrl, safeRemoteImageUrl } from "../lib/remote-image";
import { useLazyInView } from "../lib/use-lazy-in-view";

type Props = {
  src?: string | null;
  srcList?: string[];
  name?: string | null;
  size?: number;
  className?: string;
  /** Escudos above-the-fold (destacados). */
  eager?: boolean;
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
  eager = false,
}: Props) {
  const urls = useMemo(() => {
    const list = srcList?.length ? srcList : src ? [src] : [];
    return [
      ...new Set(
        list
          .map((u) => normalizeRemoteImageUrl(u))
          .filter((u): u is string => Boolean(u))
      ),
    ];
  }, [src, srcList]);

  const { ref, inView } = useLazyInView({
    eager,
    rootMargin: eager ? "0px" : "160px 0px",
  });

  const [urlIndex, setUrlIndex] = useState(0);
  const [retry, setRetry] = useState(0);
  const [failed, setFailed] = useState(false);

  const initials = teamInitials(name);
  const hue =
    (name?.split("").reduce((a, c) => a + c.charCodeAt(0), 0) ?? 0) % 360;

  const currentUrl = urls[urlIndex];
  const safeUrl = safeRemoteImageUrl(currentUrl);
  const optimizable = canOptimizeImageSrc(safeUrl);
  const displaySrc = safeUrl ? crestSrc(safeUrl, retry) : null;
  const canLoadImage = Boolean(displaySrc && !failed && (eager || inView));
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
      ref={ref}
      className={wrapperClass}
      style={{ width: size, height: size }}
      title={name ?? undefined}
    >
      {canLoadImage && optimizable ? (
        <Image
          key={`${urlIndex}-${retry}`}
          src={displaySrc!}
          alt=""
          width={size}
          height={size}
          className="fh-team-crest-img"
          sizes={POSTER_SIZES.crest}
          quality={IMAGE_QUALITY}
          priority={eager}
          onError={handleError}
        />
      ) : canLoadImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={`${urlIndex}-${retry}`}
          src={displaySrc!}
          alt=""
          className="fh-team-crest-img"
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          onError={handleError}
        />
      ) : (
        <div
          className="fh-team-crest-placeholder"
          style={{
            background: `linear-gradient(135deg, hsl(${hue}, 55%, 42%), hsl(${hue}, 60%, 28%))`,
            fontSize: size * 0.32,
          }}
        >
          {initials}
        </div>
      )}
    </div>
  );
}
