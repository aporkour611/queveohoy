type Props = {
  href: string;
  variant?: "gold" | "dark" | "light";
  className?: string;
};

export function JustWatchBrandedLink({
  href,
  variant = "gold",
  className,
}: Props) {
  const rootClass = [
    "jw-branded-link",
    `jw-branded-link-${variant}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <a
      href={href}
      className={rootClass}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span className="jw-branded-logo" aria-hidden>
        JW
      </span>
      <span className="jw-branded-text">JustWatch</span>
    </a>
  );
}
