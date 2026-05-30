import Link from "next/link";
import { FEATURED_SEO_GUIDE_SLUGS, SEO_GUIDES } from "../lib/seo-guides";

export function SeoGuidesPromo() {
  const featured = FEATURED_SEO_GUIDE_SLUGS.map((slug) =>
    SEO_GUIDES.find((guide) => guide.slug === slug)
  ).filter((guide) => guide != null);

  return (
    <aside
      className="qvh-guides-promo fh-container"
      aria-labelledby="qvh-guides-promo-heading"
    >
      <div className="qvh-guides-promo-inner">
        <h2 id="qvh-guides-promo-heading" className="qvh-guides-promo-title">
          Dónde ver
        </h2>
        <p className="qvh-guides-promo-lead">
          Guías de canales y plataformas en España
        </p>
        <ul className="qvh-guides-promo-grid">
          {featured.map((guide) => (
            <li key={guide.slug}>
              <Link
                href={`/guia/${guide.slug}`}
                className="qvh-guides-promo-link"
              >
                {guide.title}
              </Link>
            </li>
          ))}
        </ul>
        <p className="qvh-guides-promo-more">
          <Link href="/guia">Ver todas las guías →</Link>
        </p>
      </div>
    </aside>
  );
}
