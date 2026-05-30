"use client";

import { useEffect } from "react";
import {
  dispatchHomeFeedActivate,
  markHomeFeedWeekIntent,
  prefetchHomeFeedWeek,
} from "@/app/lib/home-feed-intent";

/** Puente mínimo: clics en el shell SSR activan hidratación y prefetch de la semana. */
export function FeedControlsShellBridge() {
  useEffect(() => {
    const shell = document.getElementById("feed-controls-ssr");
    if (!shell) return;

    const handleWeekIntent = () => {
      markHomeFeedWeekIntent();
      prefetchHomeFeedWeek();
      dispatchHomeFeedActivate();
    };

    const handlePointer = (event: Event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (!target.closest("[data-qvh-week-view]")) return;
      event.preventDefault();
      handleWeekIntent();
    };

    shell.addEventListener("click", handlePointer);
    shell.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      handlePointer(event);
    });

    return () => {
      shell.removeEventListener("click", handlePointer);
    };
  }, []);

  return null;
}
