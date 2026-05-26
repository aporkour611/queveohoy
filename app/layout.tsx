import type { Metadata, Viewport } from "next";
import { Barlow_Condensed } from "next/font/google";
import "./globals.css";
import "./brand.css";
import "./futbolhoy.css";
import "./destacados.css";
import "./media.css";
import { CookieConsentRoot } from "./components/CookieConsentRoot";
import { rootMetadata, siteUrl } from "./lib/seo";

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = rootMetadata;

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${barlowCondensed.variable} h-full antialiased`}>
      <head>
        <link rel="preconnect" href="https://crests.football-data.org" />
        <link rel="preconnect" href="https://image.tmdb.org" />
        <link rel="preconnect" href="https://r2.thesportsdb.com" />
        <link
          rel="alternate"
          type="application/rss+xml"
          title="Qué veo hoy — agenda TV"
          href={`${siteUrl}/feed.xml`}
        />
      </head>
      <body className="min-h-full flex flex-col" style={{ margin: 0 }}>
        <CookieConsentRoot>{children}</CookieConsentRoot>
      </body>
    </html>
  );
}
