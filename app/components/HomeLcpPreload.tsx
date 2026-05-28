type Props = {
  href: string | null;
};

export function HomeLcpPreload({ href }: Props) {
  if (!href) return null;

  return (
    <link
      rel="preload"
      as="image"
      href={href}
      fetchPriority="high"
    />
  );
}
