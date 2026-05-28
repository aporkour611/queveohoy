export const INSTALL_PROMPT_DISMISSED_KEY = "qvh-install-prompt-dismissed";
export const INSTALL_PROMPT_AVAILABLE_EVENT = "qvh-install-prompt-available";
export const INSTALL_PROMPT_DELAY_MS = 3500;

export type InstallPlatform = "ios" | "android" | "desktop";

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

let deferredInstallPrompt: BeforeInstallPromptEvent | null = null;

export function isAppInstalled(): boolean {
  if (typeof window === "undefined") return false;

  const standaloneMedia = window.matchMedia("(display-mode: standalone)").matches;
  const iosStandalone =
    (navigator as Navigator & { standalone?: boolean }).standalone === true;

  return standaloneMedia || iosStandalone;
}

export function isIosDevice(): boolean {
  if (typeof navigator === "undefined") return false;

  const ua = navigator.userAgent;
  const isClassicIos = /iPad|iPhone|iPod/.test(ua);
  const isIpadOs =
    navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;

  return isClassicIos || isIpadOs;
}

export function isAndroidDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android/i.test(navigator.userAgent);
}

export function getInstallPlatform(): InstallPlatform {
  if (isIosDevice()) return "ios";
  if (isAndroidDevice()) return "android";
  return "desktop";
}

export function isInstallPromptDismissed(): boolean {
  if (typeof window === "undefined") return true;

  try {
    return localStorage.getItem(INSTALL_PROMPT_DISMISSED_KEY) === "1";
  } catch {
    return false;
  }
}

export function dismissInstallPrompt(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(INSTALL_PROMPT_DISMISSED_KEY, "1");
  } catch {}
}

export function canOfferInstallPrompt(): boolean {
  if (typeof window === "undefined") return false;
  if (isAppInstalled()) return false;
  if (isInstallPromptDismissed()) return false;
  return true;
}

export function hasDeferredInstallPrompt(): boolean {
  return deferredInstallPrompt !== null;
}

export function captureInstallPrompt(onAvailable?: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const handleBeforeInstall = (event: Event) => {
    event.preventDefault();
    deferredInstallPrompt = event as BeforeInstallPromptEvent;
    onAvailable?.();
    window.dispatchEvent(new Event(INSTALL_PROMPT_AVAILABLE_EVENT));
  };

  window.addEventListener("beforeinstallprompt", handleBeforeInstall);

  return () => {
    window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  };
}

export async function triggerInstallPrompt(): Promise<
  "accepted" | "dismissed" | "unavailable"
> {
  if (!deferredInstallPrompt) return "unavailable";

  await deferredInstallPrompt.prompt();
  const { outcome } = await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;

  return outcome === "accepted" ? "accepted" : "dismissed";
}

export function getInstallHeadline(platform: InstallPlatform): string {
  if (platform === "ios") {
    return "¿Añadir Qué veo hoy a tu pantalla de inicio?";
  }
  if (platform === "android") {
    return "¿Instalar Qué veo hoy en tu móvil?";
  }
  return "¿Instalar Qué veo hoy en tu ordenador?";
}

export function getInstallPrimaryLabel(platform: InstallPlatform): string {
  if (platform === "ios") return "Cómo añadirla";
  return "Instalar app";
}

export const INSTALL_BENEFITS = [
  "Acceso directo en un toque — sin buscar en el navegador",
  "Abre al instante, como una app nativa",
  "Tus avisos y preferencias, siempre a mano",
] as const;
