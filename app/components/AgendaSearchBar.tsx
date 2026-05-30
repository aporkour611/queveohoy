"use client";

import { useCallback, useId, type KeyboardEvent } from "react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  resultCount?: number;
  totalCount?: number;
};

export function AgendaSearchBar({
  value,
  onChange,
  resultCount,
  totalCount,
}: Props) {
  const inputId = useId();

  const handleClear = useCallback(() => {
    onChange("");
  }, [onChange]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Escape") {
        event.preventDefault();
        handleClear();
        event.currentTarget.blur();
      }
    },
    [handleClear]
  );

  const trimmed = value.trim();
  const statusLabel =
    trimmed && totalCount !== undefined && resultCount !== undefined
      ? resultCount === 0
        ? "Sin coincidencias en la agenda"
        : `${resultCount} de ${totalCount}`
      : null;

  return (
    <div className="fh-agenda-search" role="search" aria-label="Buscar en la agenda">
      <label className="sr-only" htmlFor={inputId}>
        Buscar en la agenda con lenguaje natural
      </label>
      <div className="fh-agenda-search-field">
        <svg
          className="fh-agenda-search-icon"
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
          id={inputId}
          type="search"
          className="fh-agenda-search-input"
          placeholder="Barça, Champions, DAZN… o pregunta en natural"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          enterKeyHint="search"
          autoComplete="off"
          spellCheck={false}
        />
        {trimmed ? (
          <button
            type="button"
            className="fh-agenda-search-clear"
            onClick={handleClear}
            aria-label="Borrar búsqueda"
          >
            ×
          </button>
        ) : null}
      </div>
      {statusLabel ? (
        <p
          className={`fh-agenda-search-status${
            resultCount === 0 ? " fh-agenda-search-status-empty" : ""
          }`}
          role="status"
          aria-live="polite"
        >
          {statusLabel}
        </p>
      ) : null}
    </div>
  );
}
