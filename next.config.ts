import type { NextConfig } from "next";
import path from "node:path";
import {
  buildEmbedSecurityHeaders,
  buildSecurityHeaders,
} from "./app/lib/security-headers";
import { SEO_HUB_SLUGS } from "./app/lib/seo-hubs";
import { siteUrl } from "./app/lib/seo";

const emptyPolyfill = path.join(process.cwd(), "empty-polyfill.js");
const polyfillAliases = {
  "next/dist/build/polyfills/polyfill-module": emptyPolyfill,
  "next/dist/build/polyfills/polyfill-module.js": emptyPolyfill,
} as const;

const apexHost = new URL(siteUrl).host;

const isProduction = process.env.NODE_ENV === "production";
const securityHeaders = buildSecurityHeaders(isProduction);
const embedSecurityHeaders = buildEmbedSecurityHeaders(isProduction);

function buildBeforeFileRewrites() {
  const rewrites: { source: string; destination: string }[] = [
    {
      source: "/api/home-feed",
      destination: "/api/events?scope=home",
    },
    {
      source: "/partidos-hoy/:fecha",
      destination: "/agenda/partidos-hoy/:fecha",
    },
  ];

  for (const slug of SEO_HUB_SLUGS) {
    rewrites.push({
      source: `/${slug}`,
      destination: `/agenda/${slug}`,
    });
  }

  return rewrites;
}

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: polyfillAliases,
  },
  webpack: (config, { webpack }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      ...polyfillAliases,
    };
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /[\\/]build[\\/]polyfills[\\/]polyfill-module(\.js)?$/,
        emptyPolyfill
      )
    );
    return config;
  },
  experimental: {
    optimizePackageImports: [
      "react",
      "react-dom",
      "@vercel/analytics",
      "@vercel/speed-insights",
    ],
    /**
     * Critters en build: mejora FCP pero duplica mucho el tiempo de deploy en Vercel/CI.
     * Activar solo en local: ENABLE_OPTIMIZE_CSS=true npm run build
     */
    optimizeCss: process.env.ENABLE_OPTIMIZE_CSS === "true",
  },
  async headers() {
    return [
      {
        source: "/embed/:path*",
        headers: embedSecurityHeaders,
      },
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [60, 62, 68, 75],
    minimumCacheTTL: 60 * 60 * 24,
    deviceSizes: [640, 750, 828, 1080],
    imageSizes: [32, 48, 64, 96, 128, 256, 320, 384],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "crests.football-data.org",
      },
      {
        protocol: "https",
        hostname: "cdn.pandascore.co",
      },
      {
        protocol: "https",
        hostname: "cdn-api.pandascore.co",
      },
      {
        protocol: "https",
        hostname: "image.tmdb.org",
      },
      {
        protocol: "https",
        hostname: "cdn.myanimelist.net",
      },
      {
        protocol: "https",
        hostname: "r2.thesportsdb.com",
      },
      {
        protocol: "https",
        hostname: "www.thesportsdb.com",
      },
      {
        protocol: "https",
        hostname: "a.espncdn.com",
      },
      {
        protocol: "https",
        hostname: "flagcdn.com",
      },
    ],
  },
  async rewrites() {
    return {
      beforeFiles: buildBeforeFileRewrites(),
    };
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: `www.${apexHost}` }],
        destination: `${siteUrl}/:path*`,
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
