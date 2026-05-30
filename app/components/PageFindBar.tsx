"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import {
  clearPageFindHighlights,
  collectPageFindRanges,
  scrollRangeIntoView,
  setPageFindHighlights,
} from "../lib/page-find";

type Props = {
  /** Elemento raíz donde buscar (p. ej. `#main-content`). */
  containerId?: string;
};

function readScrollAnchorOffset(): number {
  const navH = parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue("--qvh-navbar-h")
  );
  return (Number.isFinite(navH) ? navH : 64) + 12;
}

export function PageFindBar({ containerId = "main-content" }: Props) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const rangesRef = useRef<Range[]>([]);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [matchCount, setMatchCount] = useState(0);
  const [status, setStatus] = useState<"idle" | "found" | "empty">("idle");

  const clearFind = useCallback(() => {
    rangesRef.current = [];
    setMatchCount(0);
    setActiveIndex(0);
    setStatus("idle");
    clearPageFindHighlights();
  }, []);

  const runFind = useCallback(
    (rawQuery: string, preferredIndex = 0) => {
      const container = document.getElementById(containerId);
      if (!container) return;

      const trimmed = rawQuery.trim();
      if (!trimmed) {
        clearFind();
        return;
      }

      const { ranges, count } = collectPageFindRanges(container, trimmed);
      rangesRef.current = ranges;
      setMatchCount(count);

      if (count === 0) {
        setActiveIndex(0);
        setStatus("empty");
        clearPageFindHighlights();
        return;
      }

      const index = Math.min(Math.max(preferredIndex, 0), count - 1);
      setActiveIndex(index);
      setStatus("found");
      setPageFindHighlights(ranges, index);
      scrollRangeIntoView(ranges[index], readScrollAnchorOffset());
    },
    [clearFind, containerId]
  );

  const goToMatch = useCallback(
    (delta: number) => {
      const ranges = rangesRef.current;
      if (!ranges.length) return;

      const next = (activeIndex + delta + ranges.length) % ranges.length;
      setActiveIndex(next);
      setPageFindHighlights(ranges, next);
      scrollRangeIntoView(ranges[next], readScrollAnchorOffset());
    },
    [activeIndex]
  );

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      runFind(query, 0);
    },
    [query, runFind]
  );

  const handleInputKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        event.preventDefault();
        if (event.shiftKey && matchCount > 0) {
          goToMatch(-1);
          return;
        }
        if (matchCount > 0) {
          goToMatch(1);
          return;
        }
        runFind(query, 0);
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        setQuery("");
        clearFind();
        inputRef.current?.blur();
      }
    },
    [clearFind, goToMatch, matchCount, query, runFind]
  );

  useEffect(() => {
    if (!query.trim()) {
      clearFind();
      return;
    }

    const timer = window.setTimeout(() => runFind(query, 0), 280);
    return () => window.clearTimeout(timer);
  }, [clearFind, query, runFind]);

  useEffect(() => {
    return () => clearPageFindHighlights();
  }, []);

  useEffect(() => {
    const container = document.getElementById(containerId);
    if (!container || !query.trim()) return;

    let timer = 0;
    const observer = new MutationObserver(() => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => runFind(query, activeIndex), 150);
    });

    observer.observe(container, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
    };
  }, [activeIndex, containerId, query, runFind]);

  const statusLabel =
    status === "empty"
      ? "Sin coincidencias"
      : matchCount > 0
        ? `${activeIndex + 1} / ${matchCount}`
        : null;

  return (
    <aside
      className="qvh-page-find-rail"
      data-page-find-ignore
      aria-label="Buscar en la página"
    >
      <form className="qvh-page-find" onSubmit={handleSubmit}>
        <label className="sr-only" htmlFor={inputId}>
          Buscar en la agenda
        </label>
        <div className="qvh-page-find-field">
          <svg
            className="qvh-page-find-icon"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
          >
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path
              d="M20 20l-3.5-3.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <input
            ref={inputRef}
            id={inputId}
            type="search"
            className="qvh-page-find-input"
            placeholder="Buscar…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleInputKeyDown}
            enterKeyHint="search"
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        {statusLabel ? (
          <p
            className={`qvh-page-find-status${
              status === "empty" ? " qvh-page-find-status-empty" : ""
            }`}
            role="status"
            aria-live="polite"
          >
            {statusLabel}
          </p>
        ) : null}

        {matchCount > 1 ? (
          <div className="qvh-page-find-nav">
            <button
              type="button"
              className="qvh-page-find-nav-btn"
              onClick={() => goToMatch(-1)}
              aria-label="Coincidencia anterior"
            >
              ↑
            </button>
            <button
              type="button"
              className="qvh-page-find-nav-btn"
              onClick={() => goToMatch(1)}
              aria-label="Siguiente coincidencia"
            >
              ↓
            </button>
          </div>
        ) : null}
      </form>
    </aside>
  );
}
