export type ProductRelease = {
  version: string;
  date: string;
  title: string;
  highlights: string[];
};

/** Historial público de releases (12 meses de producto). */
export const PRODUCT_RELEASES: ProductRelease[] = [
  {
    version: "10.0.0",
    date: "2026-05-30",
    title: "Grupos neon — design system v10",
    highlights: [
      "Panel de filtros con barras GRUPOS PRINCIPALES (mockup aprobado por diseño)",
      "Subgrupos en tiles cuadrados con iconos SVG neon y glow por categoría",
      "Revisión de diseño documentada en docs/DISENO-REVISION-GRUPOS-v10.md",
      "Rallye «Próximamente»; MotoGP renombrado; TV streams/directos unificados",
      "Herencia v7: LCP premium, semana 1-clic, view transitions",
      "Roadmap consolidado v8→v10 en docs/ROADMAP-10.0.md",
    ],
  },
  {
    version: "7.0.0",
    date: "2026-05-30",
    title: "Experiencia premium — v7",
    highlights: [
      "Core Web Vitals: LCP TMDB directo, SSR sin pósters bajo destacados, prefetch semanal",
      "Imágenes AVIF/WebP con blur-up, shimmer lazy y compresión batch (`npm run posters:compress`)",
      "API `/api/events?scope=week` optimizada (7 días exactos, caché CDN)",
      "Preconnect a TMDB, TheSportsDB y MAL; view transitions Hoy ↔ Semana",
      "Semana completa: 1 clic desde shell SSR + hidratación instantánea",
      "Scripts `npm run perf:budget` y `npm run verify:prod:v7`",
      "Roadmap: docs/ROADMAP-7.0.md",
    ],
  },
  {
    version: "5.0.0",
    date: "2026-05-30",
    title: "Personalización e IA — v5",
    highlights: [
      "Sección «Para ti esta noche» con prime time y tus plataformas",
      "Filtro global «Solo mis plataformas» en el feed de la home",
      "Asistente «¿Qué veo?» con Vercel AI SDK (fallback inteligente sin API key)",
      "Drawer de detalle de evento al tocar una tarjeta (móvil y desktop)",
      "API POST /api/assistant con rate limit y herramientas sobre la agenda real",
      "Página /asistente y botón flotante en la home",
    ],
  },
  {
    version: "4.0.0",
    date: "2026-05-30",
    title: "Universo Queveo — web",
    highlights: [
      "Portal de cuenta v2 con menú lateral: favoritos, plataformas, avisos y seguridad",
      "Mis plataformas: guarda dónde ves (Movistar+, DAZN, Netflix…) en tu perfil",
      "API v1: paginación con cursor en /api/v1/feed y búsqueda en /api/v1/search",
      "Búsqueda en agenda por tokens (multi-palabra) y final Champions PSG-Arsenal 30 may 18:00",
      "Animaciones hover individuales en escudos del hero Champions Week",
      "Exportación RGPD y badge «Tus plataformas» en tarjetas del feed",
      "Checklist de despliegue: docs/ACCIONES-MANUALES-4.0.md",
    ],
  },
  {
    version: "2.0.0",
    date: "2026-09-01",
    title: "Plataforma — API, widget y calidad",
    highlights: [
      "API pública v1 read-only (/api/v1/feed y /api/v1/events/[id])",
      "Widget embed «Qué ver esta noche» para medios y partners",
      "Login con Google además de magic link",
      "Tests E2E con Playwright y página /desarrolladores",
    ],
  },
  {
    version: "1.5.0",
    date: "2026-06-01",
    title: "Operaciones y escala editorial",
    highlights: [
      "Admin v2: listado con filtros, edición inline y cron manual",
      "Alertas Slack/webhook si el cron falla o fútbol = 0 eventos",
      "Push «solo favoritos» vinculado a cuenta de usuario",
      "Página /aviso-legal y enlace en footer",
    ],
  },
  {
    version: "1.4.0",
    date: "2026-07-15",
    title: "Rendimiento y profundidad SEO",
    highlights: [
      "Optimización LCP móvil y preload de poster real",
      "+6 guías SEO (Eurocopa, Roland Garros, Eurovisión…)",
      "Tests smoke del cron con mocks de APIs críticas",
      "Bloque «Dónde ver» en hubs del footer",
    ],
  },
  {
    version: "1.3.0",
    date: "2026-06-15",
    title: "Cuenta y favoritos",
    highlights: [
      "Auth magic link con Supabase en /cuenta/login",
      "Corazón en tarjetas → tabla favorites con RLS",
      "Página /cuenta con mis favoritos y preferencias push",
    ],
  },
  {
    version: "1.2.0",
    date: "2026-05-30",
    title: "Secciones TV y catálogo diferenciadas + guías ampliadas",
    highlights: [
      "Contenedores visuales con barra lateral para TV y streaming",
      "8 guías SEO «dónde ver» (Champions, LaLiga, F1, UFC, NBA…)",
      "Páginas Sobre, Contacto y Novedades",
      "Admin: listado y borrado de eventos recientes",
    ],
  },
  {
    version: "1.1.0",
    date: "2026-03-15",
    title: "Push, PWA e instalación en móvil",
    highlights: [
      "Notificaciones push con preferencias por categoría",
      "Manifest PWA e iconos de app",
      "Cookie consent y cumplimiento básico RGPD",
    ],
  },
  {
    version: "1.0.0",
    date: "2026-01-20",
    title: "Lanzamiento público v1",
    highlights: [
      "Agenda multi-día con filtros y destacados semanales",
      "15 hubs SEO y páginas de partido indexables",
      "Cron unificado: fútbol, motor, UFC, e-sports, TMDB, TV",
      "RSS, sitemap dinámico e IndexNow",
    ],
  },
  {
    version: "0.9.0",
    date: "2025-11-08",
    title: "Entretenimiento y parrilla TV española",
    highlights: [
      "Reality, concursos y directos con horario RTVE/TVmaze",
      "Catálogo cine, series y anime (TMDB + Jikan)",
      "Posters editoriales y recetas de portada",
    ],
  },
  {
    version: "0.7.0",
    date: "2025-09-02",
    title: "Deportes ampliados y hubs temáticos",
    highlights: [
      "NBA, tenis, ciclismo, Copa del Rey, Premier League",
      "Tarjetas por deporte con escudos y canales",
      "Páginas /partidos-hoy/[fecha] rolling 14 días",
    ],
  },
  {
    version: "0.5.0",
    date: "2025-07-10",
    title: "MVP agenda deportiva",
    highlights: [
      "Home con partidos del día (LaLiga, Champions, F1, MotoGP, UFC)",
      "Supabase + cron football-data.org",
      "Deploy Vercel y CI con tests unitarios",
    ],
  },
];

export const LATEST_RELEASE = PRODUCT_RELEASES[0];
