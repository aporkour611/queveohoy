import type { NextConfig } from "next";

const hubSlugs = [
  "partidos-hoy",
  "futbol",
  "champions",
  "laliga",
  "premier-league",
  "formula-1",
  "motogp",
  "ufc",
  "baloncesto",
  "series",
];

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["react", "react-dom"],
  },
  images: {
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
        hostname: "image.tmdb.org",
      },
    ],
  },
  async rewrites() {
    return {
      beforeFiles: hubSlugs.map((slug) => ({
        source: `/${slug}`,
        destination: `/agenda/${slug}`,
      })),
    };
  },
};

export default nextConfig;
