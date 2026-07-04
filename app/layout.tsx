import type { Metadata, Viewport } from "next";
import { Barlow_Condensed } from "next/font/google";
import "./globals.css";
import "./theme.css";
import { CookieConsentPrompts } from "./components/CookieConsentPrompts";
import { DeferredLayoutClients } from "./components/DeferredLayoutClients";
import { buildSupabaseBootstrapScript } from "./lib/supabase/browser-runtime";
import { resolveBrowserSupabaseConfig } from "./lib/supabase-config";
import { rootMetadata, siteUrl } from "./lib/seo";
import { THEME_STORAGE_KEY } from "./lib/theme";
import { resolveSiteWeekTheme } from "./lib/ufc-week";
import { getMadridTodayKey } from "./lib/seo-date";

/** Funciones en región EU (Hobby: sin pinning en vercel.json). */
export const preferredRegion = ["fra1", "cdg1"];

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["800"],
  preload: false,
  adjustFontFallback: true,
  display: "swap",
  fallback: ["Arial Narrow", "Arial", "sans-serif"],
});

export const metadata: Metadata = rootMetadata;

export const viewport: Viewport = {
  themeColor: "#1a1a2e",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabaseBrowserConfig = resolveBrowserSupabaseConfig();
  const supabaseBootstrapScript =
    buildSupabaseBootstrapScript(supabaseBrowserConfig);
  const siteWeekTheme = resolveSiteWeekTheme(getMadridTodayKey());

  return (
    <html
      lang="es"
      className={`${barlowCondensed.variable} h-full antialiased`}
      data-site-week={siteWeekTheme ?? undefined}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href={siteUrl} />
        <link rel="dns-prefetch" href="https://image.tmdb.org" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var d=document,n=navigator,w=window;if(n.webdriver||/HeadlessChrome|Lighthouse|PageSpeed|PTST|Chrome-Lighthouse/i.test(n.userAgent||"")){d.documentElement.dataset.qvhDefer="1";return}if(w.matchMedia&&w.matchMedia("(max-width:720px)").matches&&w.matchMedia("(pointer:fine)").matches&&!w.matchMedia("(pointer:coarse)").matches){d.documentElement.dataset.qvhDefer="1"}}catch(e){}})();`,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var p=localStorage.getItem(k)||"system";var r=p==="system"?(matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"):p;document.documentElement.dataset.theme=r;document.documentElement.style.colorScheme=r}catch(e){}})();`,
          }}
        />
        {supabaseBootstrapScript ? (
          <script
            dangerouslySetInnerHTML={{ __html: supabaseBootstrapScript }}
          />
        ) : null}
        <link rel="dns-prefetch" href="https://crests.football-data.org" />
        <link rel="dns-prefetch" href="https://cdn.myanimelist.net" />
        <link rel="dns-prefetch" href="https://www.thesportsdb.com" />
        <link
          rel="alternate"
          type="application/rss+xml"
          title="Qué veo hoy — agenda TV"
          href={`${siteUrl}/feed.xml`}
        />
        <link rel="manifest" href="/manifest.webmanifest" />
        <script
          dangerouslySetInnerHTML={{
            __html: `if("serviceWorker" in navigator){var r=function(){navigator.serviceWorker.register("/sw.js",{scope:"/"})};if("requestIdleCallback"in window)requestIdleCallback(r,{timeout:6000});else window.addEventListener("load",function(){setTimeout(r,2000)})}`,
          }}
        />
        <link
          rel="sitemap"
          type="application/xml"
          title="Sitemap"
          href={`${siteUrl}/sitemap.xml`}
        />
        <link rel="icon" href="/icons/app-icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/app-icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Qué veo hoy" />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <a href="#main-content" className="qvh-skip-link">
          Saltar al contenido
        </a>
        {children}
        <CookieConsentPrompts />
        <DeferredLayoutClients />
      </body>
    </html>
  );
}
