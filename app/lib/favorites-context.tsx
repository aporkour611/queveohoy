"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type FavoritesContextValue = {
  loaded: boolean;
  isLoggedIn: boolean;
  favoriteIds: Set<number>;
  isFavorite: (eventId: number) => boolean;
  toggleFavorite: (eventId: number) => Promise<boolean>;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [loaded, setLoaded] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [meRes, favRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/favorites"),
        ]);

        if (cancelled) return;

        const me = await meRes.json();
        const fav = await favRes.json();
        setIsLoggedIn(Boolean(me.user));
        setFavoriteIds(new Set((fav.eventIds ?? []) as number[]));
      } catch {
        if (!cancelled) {
          setIsLoggedIn(false);
          setFavoriteIds(new Set());
        }
      } finally {
        if (!cancelled) setLoaded(true);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const isFavorite = useCallback(
    (eventId: number) => favoriteIds.has(eventId),
    [favoriteIds]
  );

  const toggleFavorite = useCallback(async (eventId: number) => {
    const wasFavorite = favoriteIds.has(eventId);

    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (wasFavorite) next.delete(eventId);
      else next.add(eventId);
      return next;
    });

    try {
      const res = await fetch("/api/favorites/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
      });

      if (!res.ok) throw new Error("toggle failed");

      const data = await res.json();
      setIsLoggedIn(true);
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (data.favorited) next.add(eventId);
        else next.delete(eventId);
        return next;
      });
      return Boolean(data.favorited);
    } catch {
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (wasFavorite) next.add(eventId);
        else next.delete(eventId);
        return next;
      });
      return wasFavorite;
    }
  }, [favoriteIds]);

  const value = useMemo(
    () => ({
      loaded,
      isLoggedIn,
      favoriteIds,
      isFavorite,
      toggleFavorite,
    }),
    [loaded, isLoggedIn, favoriteIds, isFavorite, toggleFavorite]
  );

  return (
    <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error("useFavorites debe usarse dentro de FavoritesProvider");
  }
  return ctx;
}
