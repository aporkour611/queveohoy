/** CSP pragmática: scripts restringidos; estilos inline por React/Next. */
export function buildContentSecurityPolicy(isProduction: boolean): string {
  const directives = [
    "default-src 'self'",
    [
      "script-src 'self'",
      "https://va.vercel-scripts.com",
      ...(isProduction ? [] : ["'unsafe-eval'"]),
      "'unsafe-inline'",
    ].join(" "),
    "style-src 'self' 'unsafe-inline'",
    [
      "img-src 'self' data: blob:",
      "https://crests.football-data.org",
      "https://cdn.pandascore.co",
      "https://cdn-api.pandascore.co",
      "https://image.tmdb.org",
      "https://cdn.myanimelist.net",
      "https://r2.thesportsdb.com",
      "https://www.thesportsdb.com",
      "https://a.espncdn.com",
      "https://flagcdn.com",
    ].join(" "),
    "font-src 'self' data:",
    [
      "connect-src 'self'",
      "https://vitals.vercel-insights.com",
      "https://va.vercel-scripts.com",
      "https://*.supabase.co",
      "wss://*.supabase.co",
    ].join(" "),
    "worker-src 'self'",
    "manifest-src 'self'",
    [
      "frame-src 'self'",
      "https://player.twitch.tv",
      "https://www.twitch.tv",
      "https://www.rtve.es",
      "https://www.atresplayer.com",
      "https://*.atresmedia.com",
      "https://www.youtube.com",
      "https://www.youtube-nocookie.com",
      "https://www.ccma.cat",
      "https://ver.gc.gol.es",
      "https://www.golplay.es",
    ].join(" "),
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    "object-src 'none'",
  ];

  if (isProduction) {
    directives.push("upgrade-insecure-requests");
  }

  return directives.join("; ");
}

export function buildSecurityHeaders(isProduction: boolean) {
  return [
    { key: "X-DNS-Prefetch-Control", value: "on" },
    {
      key: "Strict-Transport-Security",
      value: "max-age=63072000; includeSubDomains; preload",
    },
    { key: "X-Frame-Options", value: "SAMEORIGIN" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=(), payment=()",
    },
    {
      key: "Content-Security-Policy",
      value: buildContentSecurityPolicy(isProduction),
    },
  ];
}
