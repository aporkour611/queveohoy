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

export type AuthUser = {
  id: string;
  email: string | null;
  displayName: string;
};

type SessionContextValue = {
  loaded: boolean;
  user: AuthUser | null;
  favoriteIds: Set<number>;
  favoriteEvents: EventRow[];
  isFavorite: (eventId: number) => boolean;
  toggleFavorite: (eventId: number, event?: EventRow) => Promise<boolean>;
  refreshSession: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loaded, setLoaded] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [favoriteEvents, setFavoriteEvents] = useState<EventRow[]>([]);

  const applySession = useCallback(
    (
      nextUser: AuthUser | null,
      ids: number[],
      events: EventRow[]
    ) => {
      setUser(nextUser);
      setFavoriteIds(new Set(ids));
      setFavoriteEvents(events);
      if (nextUser) writeCachedIds(nextUser.id, ids);
    },
    []
  );

  const refreshSession = useCallback(async () => {
    const res = await fetch("/api/session");
    if (!res.ok) {
      applySession(null, [], []);
      return;
    }

    const data = await res.json();
    const nextUser = (data.user ?? null) as AuthUser | null;

    if (!nextUser) {
      applySession(null, [], []);
      return;
    }

    applySession(
      nextUser,
      (data.favoriteIds ?? []) as number[],
      normalizeEvents(data.favoriteEvents)
    );
  }, [applySession]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/session");
        if (!res.ok) throw new Error("session failed");

        const data = await res.json();
        if (cancelled) return;

        const nextUser = (data.user ?? null) as AuthUser | null;
        if (!nextUser) {
          applySession(null, [], []);
          return;
        }

        const cached = readCachedIds(nextUser.id);
        if (cached.length) {
          setFavoriteIds(new Set(cached));
        }

        applySession(
          nextUser,
          (data.favoriteIds ?? []) as number[],
          normalizeEvents(data.favoriteEvents)
        );
      } catch {
        if (!cancelled) applySession(null, [], []);
      } finally {
        if (!cancelled) setLoaded(true);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [applySession]);

  const isFavorite = useCallback(
    (eventId: number) => favoriteIds.has(eventId),
    [favoriteIds]
  );

  const toggleFavorite = useCallback(
    async (eventId: number, event?: EventRow) => {
      const userId = user?.id;
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
          await refreshSession();
        } catch {}
        return wasFavorite;
      }
    },
    [refreshSession, user?.id]
  );

  const value = useMemo(
    () => ({
      loaded,
      user,
      favoriteIds,
      favoriteEvents,
      isFavorite,
      toggleFavorite,
      refreshSession,
    }),
    [
      loaded,
      user,
      favoriteIds,
      favoriteEvents,
      isFavorite,
      toggleFavorite,
      refreshSession,
    ]
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return { loaded: ctx.loaded, user: ctx.user };
}

export function useFavorites() {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useFavorites debe usarse dentro de AuthProvider");
  }
  return {
    loaded: ctx.loaded,
    isLoggedIn: Boolean(ctx.user),
    userId: ctx.user?.id ?? null,
    favoriteIds: ctx.favoriteIds,
    favoriteEvents: ctx.favoriteEvents,
    isFavorite: ctx.isFavorite,
    toggleFavorite: ctx.toggleFavorite,
  };
}

/** Compatibilidad con la home; la sesión ya vive en AuthProvider. */
export function FavoritesProvider({ children }: { children: ReactNode }) {
  return children;
}
