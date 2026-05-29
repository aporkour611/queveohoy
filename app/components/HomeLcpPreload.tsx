import type { SpotlightPreloadEntry } from "../lib/optimized-image";

type Props = {
  entries: SpotlightPreloadEntry[];
};

export function HomeLcpPreload({ entries }: Props) {
  if (entries.length === 0) return null;

  return (
    <>
      {entries.map((entry) => (
        <link
          key={entry.href}
          rel="preload"
          as="image"
          href={entry.href}
          imageSrcSet={entry.imageSrcSet}
          imageSizes={entry.imageSizes}
          fetchPriority="high"
          crossOrigin={entry.href.startsWith("http") ? "anonymous" : undefined}
        />
      ))}
    </>
  );
}
