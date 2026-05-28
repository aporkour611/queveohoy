"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from "react";

type HomeResetContextValue = {
  registerReset: (fn: () => void) => void;
  resetHome: () => void;
};

const HomeResetContext = createContext<HomeResetContextValue | null>(null);

export function HomeResetProvider({ children }: { children: ReactNode }) {
  const resetRef = useRef<(() => void) | null>(null);

  const registerReset = useCallback((fn: () => void) => {
    resetRef.current = fn;
  }, []);

  const resetHome = useCallback(() => {
    resetRef.current?.();
  }, []);

  const value = useMemo(
    () => ({ registerReset, resetHome }),
    [registerReset, resetHome]
  );

  return (
    <HomeResetContext.Provider value={value}>{children}</HomeResetContext.Provider>
  );
}

export function useHomeReset() {
  const ctx = useContext(HomeResetContext);
  if (!ctx) {
    throw new Error("useHomeReset must be used within HomeResetProvider");
  }
  return ctx;
}
