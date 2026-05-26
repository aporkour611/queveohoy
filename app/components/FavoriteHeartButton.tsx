"use client";

import { useRouter } from "next/navigation";
import type { EventRow } from "./types";
import { useFavorites } from "../lib/auth-context";

type Props = {
  eventId: number;
  event?: EventRow;
};

function HeartIcon({ active }: { active: boolean }) {
  if (active) {
    return (
      <svg viewBox="0 0 24 24" aria-hidden className="qvh-fav-icon">
        <path
          d="M12 21s-7-4.6-9.5-8.8C.8 9.2 2.6 5.8 6.2 5.2c2-.3 3.8.8 4.7 2.3.9-1.5 2.7-2.6 4.7-2.3 3.6.6 5.4 4 3.7 7-2.5 4.2-9.5 8.8-9.5 8.8Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden className="qvh-fav-icon">
      <path
        d="M12 21s-7-4.6-9.5-8.8C.8 9.2 2.6 5.8 6.2 5.2c2-.3 3.8.8 4.7 2.3.9-1.5 2.7-2.6 4.7-2.3 3.6.6 5.4 4 3.7 7-2.5 4.2-9.5 8.8-9.5 8.8Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export function FavoriteHeartButton({ eventId, event }: Props) {
  const router = useRouter();
  const { loaded, isLoggedIn, isFavorite, toggleFavorite } = useFavorites();
  const active = isFavorite(eventId);

  if (!loaded) return null;

  return (
    <button
      type="button"
      className={`qvh-fav-btn${active ? " qvh-fav-btn-active" : ""}`}
      aria-pressed={active}
      aria-label={active ? "Quitar de favoritos" : "Añadir a favoritos"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isLoggedIn) {
          router.push("/entrar?next=/");
          return;
        }
        void toggleFavorite(eventId, event);
      }}
    >
      <HeartIcon active={active} />
    </button>
  );
}
