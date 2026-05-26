/** Enlaces estáticos para footer y navegación SEO (sin lógica de filtrado). */
export const SEO_HUB_NAV_LINKS = [
  { slug: "partidos-hoy", title: "Partidos hoy en TV" },
  { slug: "futbol", title: "Fútbol hoy en TV" },
  { slug: "champions", title: "Champions League hoy" },
  { slug: "laliga", title: "LaLiga hoy en TV" },
  { slug: "formula-1", title: "Fórmula 1 hoy" },
  { slug: "ufc", title: "UFC hoy" },
  { slug: "series", title: "Series y estrenos hoy" },
  { slug: "premier-league", title: "Premier League hoy" },
  { slug: "motogp", title: "MotoGP hoy" },
  { slug: "baloncesto", title: "Baloncesto hoy en TV" },
] as const;

export const SEO_FOOTER_HUB_SLUGS = [
  "partidos-hoy",
  "futbol",
  "champions",
  "laliga",
  "formula-1",
  "ufc",
  "series",
] as const;
