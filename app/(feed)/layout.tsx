import "../futbolhoy.css";
import "../destacados.css";
import "../media.css";
import "../push.css";
import "../channel-badges.css";
import "../event-stamp.css";

export default function FeedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <link rel="preconnect" href="https://image.tmdb.org" />
      <link rel="preconnect" href="https://crests.football-data.org" />
      <link rel="dns-prefetch" href="https://r2.thesportsdb.com" />
      {children}
    </>
  );
}
