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
import type { EventRow } from "../components/types";

type FavoritesContextValue = {
  loaded: boolean;
  isLoggedIn: boolean;
  userId: string | null;
  favoriteIds: Set<number>;
  favoriteEvents: EventRow[];
  isFavorite: (eventId: number) => boolean;
  toggleFavorite: (eventId: number, event?: EventRow) => Promise<boolean>;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

function cacheKey(userId: string) {
  return `qvh_favorites_${userId}`;
}

function readCachedIds(userId: string): number[] {
  try {
    const raw = localStorage.getItem(cacheKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((id): id is number => typeof id === "number")
      : [];
  } catch {
    return [];
  }
}

function writeCachedIds(userId: string, eventIds: number[]) {
  try {
    localStorage.setItem(cacheKey(userId), JSON.stringify(eventIds));
  } catch {}
}

function normalizeEvents(raw: unknown): EventRow[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (event): event is EventRow =>
      Boolean(event) && typeof (event as EventRow).id === "number"
  );
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [loaded, setLoaded] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [favoriteEvents, setFavoriteEvents] = useState<EventRow[]>([]);

  const applyFavorites = useCallback(
    (ids: number[], events: EventRow[], uid: string | null) => {
      setFavoriteIds(new Set(ids));
      setFavoriteEvents(events);
      if (uid) writeCachedIds(uid, ids);
    },
    []
  );

  const refreshFavorites = useCallback(async () => {
    const [meRes, favRes] = await Promise.all([
      fetch("/api/auth/me"),
      fetch("/api/favorites"),
    ]);

    const me = await meRes.json();
    const uid = me.user?.id ?? null;
    setIsLoggedIn(Boolean(uid));
    setUserId(uid);

    if (!uid) {
      applyFavorites([], [], null);
      return;
    }

    if (favRes.ok) {
      const fav = await favRes.json();
      applyFavorites(
        (fav.eventIds ?? []) as number[],
        normalizeEvents(fav.events),
        uid
      );
      return;
    }

    applyFavorites(readCachedIds(uid), [], uid);
  }, [applyFavorites]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        await refreshFavorites();
      } catch {
        if (!cancelled) {
          setIsLoggedIn(false);
          setUserId(null);
          setFavoriteIds(new Set());
          setFavoriteEvents([]);
        }
      } finally {
        if (!cancelled) setLoaded(true);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [refreshFavorites]);

  const isFavorite = useCallback(
    (eventId: number) => favoriteIds.has(eventId),
    [favoriteIds]
  );

  const toggleFavorite = useCallback(
    async (eventId: number, event?: EventRow) => {
      let wasFavorite = false;

      setFavoriteIds((prev) => {
        wasFavorite = prev.has(eventId);
        const next = new Set(prev);
        if (wasFavorite) next.delete(eventId);
        else next.add(eventId);
        if (userId) writeCachedIds(userId, [...next]);
        return next;
      });

      setFavoriteEvents((prev) => {
        if (wasFavorite) return prev.filter((item) => item.id !== eventId);
        if (!event || prev.some((item) => item.id === eventId)) return prev;
        return [event, ...prev];
      });

      try {
        const res = await fetch("/api/favorites/toggle", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventId }),
        });

        if (!res.ok) throw new Error("toggle failed");

        await refreshFavorites();
        const data = await res.json();
        return Boolean(data.favorited);
      } catch {
        await refreshFavorites();
        return wasFavorite;
      }
    },
    [refreshFavorites, userId]
  );

  const value = useMemo(
    () => ({
      loaded,
      isLoggedIn,
      userId,
      favoriteIds,
      favoriteEvents,
      isFavorite,
      toggleFavorite,
    }),
    [
      loaded,
      isLoggedIn,
      userId,
      favoriteIds,
      favoriteEvents,
      isFavorite,
      toggleFavorite,
    ]
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
