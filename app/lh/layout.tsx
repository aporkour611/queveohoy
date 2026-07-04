import "../feed-bundle.css";
import { FeedCriticalStyle } from "../components/FeedCriticalStyle";
import { HomeLcpPreload } from "../components/HomeLcpPreload";
import { getMadridTodayKey } from "../lib/seo-date";
import {
  isUfcWeekEditorialWindow,
  UFC_CASABLANCA_FIGHTER_IMAGES,
} from "../lib/ufc-week";
import { resolveHomeLcpPreloadEntries } from "../lib/home-lcp";

export default function LighthouseHomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const todayKey = getMadridTodayKey();
  const ufcEditorial = isUfcWeekEditorialWindow(todayKey);
  const lcpEntries = ufcEditorial
    ? []
    : resolveHomeLcpPreloadEntries([], todayKey);

  return (
    <>
      {ufcEditorial ? (
        <link
          rel="preload"
          as="image"
          href={UFC_CASABLANCA_FIGHTER_IMAGES.topuria}
          fetchPriority="high"
        />
      ) : (
        <HomeLcpPreload entries={lcpEntries} />
      )}
      <FeedCriticalStyle />
      {children}
    </>
  );
}
