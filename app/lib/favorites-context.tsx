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
import { useAuth } from "./auth-context";

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
  const { user, loaded: authLoaded } = useAuth();
  const [loaded, setLoaded] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [favoriteEvents, setFavoriteEvents] = useState<EventRow[]>([]);

  const userId = user?.id ?? null;
  const isLoggedIn = Boolean(userId);

  const applyFavorites = useCallback(
    (ids: number[], events: EventRow[], uid: string | null) => {
      setFavoriteIds(new Set(ids));
      setFavoriteEvents(events);
      if (uid) writeCachedIds(uid, ids);
    },
    []
  );

  const syncFavoritesFromApi = useCallback(async () => {
    if (!userId) {
      applyFavorites([], [], null);
      return;
    }

    const favRes = await fetch("/api/favorites");
    if (favRes.ok) {
      const fav = await favRes.json();
      applyFavorites(
        (fav.eventIds ?? []) as number[],
        normalizeEvents(fav.events),
        userId
      );
      return;
    }

    applyFavorites(readCachedIds(userId), [], userId);
  }, [applyFavorites, userId]);

  useEffect(() => {
    if (!authLoaded) return;

    if (!userId) {
      applyFavorites([], [], null);
      setLoaded(true);
      return;
    }

    const cached = readCachedIds(userId);
    if (cached.length) {
      setFavoriteIds(new Set(cached));
    }
    setLoaded(true);

    let cancelled = false;

    void (async () => {
      try {
        await syncFavoritesFromApi();
      } catch {
        if (!cancelled) {
          applyFavorites(readCachedIds(userId), [], userId);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authLoaded, userId, applyFavorites, syncFavoritesFromApi]);

  const isFavorite = useCallback(
    (eventId: number) => favoriteIds.has(eventId),
    [favoriteIds]
  );

  const toggleFavorite = useCallback(
    async (eventId: number, event?: EventRow) => {
      if (!userId) return false;

      let wasFavorite = false;

      setFavoriteIds((prev) => {
        wasFavorite = prev.has(eventId);
        const next = new Set(prev);
        if (wasFavorite) next.delete(eventId);
        else next.add(eventId);
        writeCachedIds(userId, [...next]);
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

        const data = await res.json();
        return Boolean(data.favorited);
      } catch {
        try {
          await syncFavoritesFromApi();
        } catch {}
        return wasFavorite;
      }
    },
    [syncFavoritesFromApi, userId]
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
