export type ProductRelease = {
  version: string;
  date: string;
  title: string;
  highlights: string[];
};

/** Historial público de releases (12 meses de producto). */
export const PRODUCT_RELEASES: ProductRelease[] = [
  {
    version: "2.70.0",
    date: "2026-06-11",
    title: "Cierre maratón 2.41–2.70",
    highlights: [
      "30 ciclos: hubs SEO, weekCount, app 1.0.0",
      "289 tests · E2E hub + feed-meta",
      "Listo para PSI bloqueante e iOS widget",
    ],
  },
  {
    version: "2.60.0",
    date: "2026-06-11",
    title: "Observabilidad semana",
    highlights: [
      "FeedFreshness con conteo semanal",
      "verify-prod comprueba weekCount",
      "Tests URLs prefetch semana",
    ],
  },
  {
    version: "2.50.0",
    date: "2026-06-11",
    title: "Hubs SEO + semana precargada",
    highlights: [
      "Prefetch doble en hubs /agenda/*",
      "feed-meta expone weekCount",
      "App 1.0.0 con enlace a cuenta web",
    ],
  },
  {
    version: "2.40.0",
    date: "2026-06-11",
    title: "Cierre maratón 30 ciclos",
    highlights: [
      "Sprint continuo 2.13→2.40 documentado",
      "Prefetch footer y tests API week",
      "Plataforma lista para PERF gate e iOS widget",
    ],
  },
  {
    version: "2.30.0",
    date: "2026-06-11",
    title: "Polish semana y docs API",
    highlights: [
      "Explorar precarga API week pública",
      "Desarrolladores documenta feed/week",
      "Limpieza URL week=1 y cache mañana",
    ],
  },
  {
    version: "2.20.0",
    date: "2026-06-11",
    title: "Explorar + API week + share móvil",
    highlights: [
      "Explorar con semana precargada e ISR",
      "API pública /api/v1/feed/week",
      "Compartir eventos y export push en RGPD",
    ],
  },
  {
    version: "2.12.0",
    date: "2026-06-11",
    title: "Semana instantánea + widget Android",
    highlights: [
      "Feed semanal precargado en SSR (ISR 15 min)",
      "Vista Semana completa sin espera al cambiar pestaña",
      "Widget Android del próximo favorito en EAS build",
    ],
  },
  {
    version: "2.11.0",
    date: "2026-06-11",
    title: "Tema app + push sync + widget data",
    highlights: [
      "Push sincronizado entre web y app móvil",
      "Tema claro/oscuro/sistema en la app",
      "Datos de widget «próximo favorito» listos para iOS/Android",
    ],
  },
  {
    version: "2.10.0",
    date: "2026-06-11",
    title: "App stores-ready + push favoritos",
    highlights: [
      "Push solo favoritos en móvil",
      "Semana offline 15 min + banner sin red",
      "Microsoft OAuth + EAS auto-submit a stores",
    ],
  },
  {
    version: "2.9.0",
    date: "2026-06-11",
    title: "Push Expo + offline + EAS CI",
    highlights: [
      "Notificaciones push nativas vía Expo (misma cola que web push)",
      "Agenda Hoy en caché 15 min sin red",
      "Apple login en app + workflow EAS Build",
    ],
  },
  {
    version: "2.8.0",
    date: "2026-06-11",
    title: "App móvil — auth y favoritos",
    highlights: [
      "4 pestañas: Hoy, Semana, Favoritos, Cuenta",
      "Login Google/magic link con Supabase en Expo",
      "Favoritos compartidos con la web",
      "EAS preview + workflow CI mobile",
    ],
  },
  {
    version: "2.7.0",
    date: "2026-06-11",
    title: "Partners, auth y app móvil",
    highlights: [
      "Webhooks con reintentos y backoff exponencial",
      "Errores OAuth legibles (Google, Apple, Microsoft)",
      "Scaffold Expo en mobile/ consumiendo API v1",
      "PSI LCP ≤3s en deploy (preparado para gate bloqueante)",
    ],
  },
  {
    version: "2.6.2",
    date: "2026-06-11",
    title: "Esta semana — estrenos de cine al día",
    highlights: [
      "El drama y estrenos pasados salen del carrusel semanal",
      "Misma regla que series: solo lo que cae en la ventana de la semana",
    ],
  },
  {
    version: "2.6.1",
    date: "2026-06-11",
    title: "Calendario — rollover medianoche",
    highlights: [
      "A las 00:00 Madrid purga, ingesta e invalida caché automáticamente",
      "El navegador recarga solo al cambiar de día",
      "Feed cacheado por fecha (no arrastra el día anterior)",
    ],
  },
  {
    version: "2.6.0",
    date: "2026-06-11",
    title: "Vercel Pro — auditoría completa",
    highlights: [
      "Keep-warm optimizado (5/15 min) y health ligero",
      "Cron core/extended, Edge rate limit, previews en PR",
      "Partido y API por consultas DB, no feed completo",
    ],
  },
  {
    version: "2.5.0",
    date: "2026-05-31",
    title: "Admin — historial webhooks",
    highlights: [
      "Tabla de entregas feed.updated por partner en /admin → Cron",
      "GET /api/admin/webhooks/history (requiere sesión admin)",
      "Persistencia en Upstash (mismas credenciales que snapshot cron)",
    ],
  },
  {
    version: "2.4.0",
    date: "2026-05-31",
    title: "Cuenta — Apple y Microsoft",
    highlights: [
      "Continuar con Apple y Microsoft en /cuenta/login",
      "Mismo callback que Google (magic link y OAuth)",
      "Requiere activar proveedores en Supabase Dashboard",
    ],
  },
  {
    version: "2.3.0",
    date: "2026-05-31",
    title: "Webhooks partners Pro",
    highlights: [
      "POST firmado a URL en PARTNER_API_KEYS (formato clave:label|webhook)",
      "Evento feed.updated tras cada cron de ingesta",
      "Cabecera X-Queveohoy-Signature HMAC-SHA256",
    ],
  },
  {
    version: "2.2.0",
    date: "2026-05-31",
    title: "API v2 — claves partner",
    highlights: [
      "X-API-Key en GET /api/v2/feed (300 req/min por partner)",
      "401 si la clave es inválida; v1 sin cambios",
      "PARTNER_API_KEYS en Vercel (formato secreto:etiqueta)",
    ],
  },
  {
    version: "2.1.0",
    date: "2026-05-31",
    title: "Admin — métricas cron",
    highlights: [
      "Dashboard en /admin pestaña Cron (feed, DB, última ingesta)",
      "Snapshot del último cron en Upstash Redis",
      "GET /api/admin/cron/status",
    ],
  },
  {
    version: "2.0.5",
    date: "2026-05-31",
    title: "LCP WebP local + uptime keep-warm",
    highlights: [
      "WebP en /posters para LCP mismo origen (menos bytes que PNG)",
      "TMDB w154 restaurado (mejor equilibrio que w92 en PSI)",
      "Keep-warm cada minuto; verify:prod comprueba /api/warm",
    ],
  },
  {
    version: "2.0.4",
    date: "2026-05-31",
    title: "LCP — poster local primero + TMDB w92",
    highlights: [
      "Prioridad LCP: PNG locales /posters (mismo origen) antes que TMDB",
      "TMDB w92 en preload e img LCP",
      "JSON-LD al final del HTML (no compite con destacados)",
    ],
  },
  {
    version: "2.0.3",
    date: "2026-05-31",
    title: "LCP móvil ≤2s — optimización destacados",
    highlights: [
      "TMDB w154 directo en preload y <img> LCP (menos bytes que w185)",
      "Preload /_next/image solo 320w; calidad preload 58",
      "Preconnect image.tmdb.org al inicio del <head>",
      "Champions Week: crestas lazy; trofeo sin priority duplicado",
    ],
  },
  {
    version: "2.0.0",
    date: "2026-05-30",
    title: "Plataforma estable 2.0",
    highlights: [
      "Graduación del RC 1.9.9: optimización imágenes, filtros, API ETag y carga diferida",
      "Feed con paneles unificados (deportes, TV, entretenimiento)",
      "verify:prod:2.0 y docs/ROADMAP-2.0.md",
      "LHCI perf ≥80% y presupuesto LCP 2s en CI",
    ],
  },
  {
    version: "1.9.9",
    date: "2026-05-30",
    title: "Release candidate pre-2.0",
    highlights: [
      "Roadmap 1.0.11→1.9.9: imágenes w185 en feed, LCP preload 320w, filtros con debounce URL",
      "Prefetch CSS filtros en intent; home-feed y events con ETag/304",
      "fetchClientJson dedup; prefetch semanal TTL 30s; feed-meta cache 60s",
      "LHCI perf ≥80% y LCP ≤2s; verify:prod:1.9",
    ],
  },
  {
    version: "1.0.3",
    date: "2026-05-30",
    title: "Deploy gate + seguridad health",
    highlights: [
      "Health: integraciones solo con Bearer CRON_SECRET (sin ?detailed=1 público)",
      "E2E en CI sin credenciales Supabase (fix deploy #150)",
      "Rate limit en /api/home-feed; secretos eliminados de docs",
      "verify-prod: health sin recon público de integraciones",
    ],
  },
  {
    version: "1.0.2",
    date: "2026-05-30",
    title: "Scorecard hardening",
    highlights: [
      "HomeFaq, guías JSON-LD, /explorar en sitemap, robots /cuenta /embed",
      "PageMain global, health probes DB+feed, rate limit APIs",
      "E2E en deploy, LHCI mobile, coverage CI",
    ],
  },
  {
    version: "1.0.1",
    date: "2026-05-30",
    title: "Excelencia operativa — scorecard 10",
    highlights: [
      "CI: CodeQL, Trivy, Snyk/SonarCloud (secrets), Dependabot, CodeRabbit",
      "Lighthouse CI + verify-prod-1.0 en deploy",
      "Cron modularizado; hardening seguridad y SSR performance",
      "API v2, rally WRC, hooks HomeFeed, rate limit Upstash opcional",
    ],
  },
  {
    version: "1.0.0",
    date: "2026-05-30",
    title: "Lanzamiento público — QueveoHoy 1.0",
    highlights: [
      "Consolidación v14→v20: dark mode feed, rally WRC, API v2 con ETag",
      "RemotePosterStatic en tarjetas SSR; CSS categorías lazy-load",
      "Focus trap en drawer de evento; #main-content en rutas clave",
      "theme-color dinámico light/dark; micro-interacciones grupos neon",
      "Hook useHomeFilterBootstrap — HomePage modular (v17)",
      "docs/ROADMAP-LANZAMIENTO-1.0.md y verify:prod:1.0",
    ],
  },
  {
    version: "13.0.0",
    date: "2026-05-30",
    title: "Performance engineering — v13",
    highlights: [
      "Arquitectura islands: SSR estático + hidratación diferida por zona",
      "TonightForYouSectionStatic — prime time sin JS en camino crítico",
      "Duel visuals (UFC/RG) y ChannelBadge como Server Components",
      "Prefetch semanal deduplicado; warm cache sin triple fetch",
      "site-shell.css — páginas legales sin feed-bundle completo",
      "FeedFreshness y meta API montados tras requestIdleCallback",
      "Presupuesto Lighthouse v13: perf ≥92, LCP ≤2.0s, CLS ≤0.08",
      "docs/ROADMAP-13.0.md y verify:prod:v13",
    ],
  },
  {
    version: "12.0.0",
    date: "2026-05-30",
    title: "Observabilidad y ecosistema — v12",
    highlights: [
      "GET /api/health y /api/feed-meta para SRE y partners",
      "FeedFreshness en home: «Agenda actualizada hace X min»",
      "PWA shortcuts: Hoy, Explorar, Esta noche",
      "Widget embed /embed/categorias para medios",
      "Design system neon documentado en /desarrolladores",
      "docs/ORGANIZACION.md — departamentos y cadencia de release",
      "Script verify:prod:v12",
    ],
  },
  {
    version: "11.0.0",
    date: "2026-05-30",
    title: "Explorar y tema — v11",
    highlights: [
      "Tema system / light / dark con toggle en nav (ThemeProvider)",
      "Página /explorar con CategoryGroupsPanel y CTA a la agenda",
      "Deep link /?filtros=futbol,tenis sincronizado con filtros",
      "API v1.1: GET /api/v1/feed?categories=... con apiMinorVersion",
      "E2E explorar, health, feed-meta y categories",
      "CI: job Lighthouse opcional (workflow_dispatch)",
      "Roadmap docs/ROADMAP-11.0.md y verify:prod:v11",
    ],
  },
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
    version: "0.1.0",
    date: "2026-01-20",
    title: "MVP público inicial",
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
