/** Hubs SEO de alta prioridad para keep-warm y rollover medianoche. */
export const PRIORITY_SEO_HUB_PATHS = [
  "/futbol",
  "/champions",
  "/laliga",
  "/formula-1",
  "/premier-league",
] as const

export type PrioritySeoHubPath = (typeof PRIORITY_SEO_HUB_PATHS)[number]
