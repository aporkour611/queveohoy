import Link from "next/link";
import {
  formatDateForMetadata,
  getRollingSeoDateKeys,
  partidosHoyDatePath,
  SEO_DATE_NAV_DAYS,
} from "../lib/seo-date";

type Props = {
  current?: string;
  dayCount?: number;
};

export function SeoDateNav({ current, dayCount = SEO_DATE_NAV_DAYS }: Props) {
  const dates = getRollingSeoDateKeys(undefined, dayCount);

  return (
    <nav className="fh-seo-date-nav" aria-label="Partidos por día">
      <h2 className="fh-seo-date-nav-title">Partidos por día</h2>
      <ul className="fh-seo-date-nav-list">
        {dates.map((dateKey) => (
          <li key={dateKey}>
            {dateKey === current ? (
              <span aria-current="page">{formatDateForMetadata(dateKey)}</span>
            ) : (
              <Link href={partidosHoyDatePath(dateKey)}>
                {formatDateForMetadata(dateKey)}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
