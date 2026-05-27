"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/** true solo en cliente (evita mismatch SSR con hora / en directo). */
export function useClientMounted(): boolean {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}
