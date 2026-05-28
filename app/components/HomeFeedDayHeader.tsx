type Props = {
  date: string;
  title: string;
  showFeaturedBadge?: boolean;
};

/** Cabecera del día en HTML estático (LCP/CLS) antes de hidratar HomeFeed. */
export function HomeFeedDayHeader({
  date,
  title,
  showFeaturedBadge = true,
}: Props) {
  return (
    <div id="home-day-header-ssr" className="fh-home-day-header-ssr">
      <h2
        id={`day-title-${date}`}
        className="fh-matchday-header"
        suppressHydrationWarning
      >
        {title}
        {showFeaturedBadge ? (
          <span className="fh-featured-badge">Destacados</span>
        ) : null}
      </h2>
    </div>
  );
}
