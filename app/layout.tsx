import type { Metadata, Viewport } from "next";
import { Barlow_Condensed } from "next/font/google";
import "./globals.css";
import "./theme.css";
import { CookieConsentRoot } from "./components/CookieConsentRoot";
import { ThemeProvider } from "./components/ThemeProvider";
import { Analytics } from "./components/Analytics";
import { SpeedInsights } from "./components/SpeedInsights";
import { buildSupabaseBootstrapScript } from "./lib/supabase/browser-runtime";
import { resolveBrowserSupabaseConfig } from "./lib/supabase-config";
import { rootMetadata, siteUrl } from "./lib/seo";
import { THEME_STORAGE_KEY } from "./lib/theme";

/** Funciones cerca de Supabase / usuarios en España (menos latencia). */
export const preferredRegion = ["cdg1", "fra1"];

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

  return (
    <html
      lang="es"
      className={`${barlowCondensed.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
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
        <link rel="preconnect" href="https://image.tmdb.org" crossOrigin="anonymous" />
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
        <ThemeProvider>
          <CookieConsentRoot>{children}</CookieConsentRoot>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
