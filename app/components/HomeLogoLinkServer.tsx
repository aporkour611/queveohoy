import { LogoMark } from "./LogoMark";

/** Logo SSR sin client boundary (menos JS en el bundle inicial). */
export function HomeLogoLinkServer() {
  return (
    <a
      href="/"
      className="qvh-logo-link"
      aria-label="Qué veo hoy — Inicio"
    >
      <LogoMark className="qvh-logo-svg" />
    </a>
  );
}
