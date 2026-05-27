"use client";

import { startTransition } from "react";

/** Evita setState síncrono en effects (regla react-hooks/set-state-in-effect). */
export function deferClientStateUpdate(update: () => void) {
  queueMicrotask(() => startTransition(update));
}
