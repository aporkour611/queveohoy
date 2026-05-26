"use client";

import { useState } from "react";
import { FILTER_GROUPS, sportLabel } from "../lib/filter-config";

type Props = {
  selected: string[];
  onChange: (ids: string[]) => void;
  isFeaturedMode: boolean;
};

function filterSummary(selected: string[]): string {
  if (selected.length === 0) return "";
  if (selected.length <= 3) {
    return selected.map(sportLabel).join(", ");
  }
  return `${selected.slice(0, 2).map(sportLabel).join(", ")} +${selected.length - 2}`;
}

export function EventFilters({ selected, onChange, isFeaturedMode }: Props) {
  const [open, setOpen] = useState(false);

  function toggle(id: string) {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  }

  function clearAll() {
    onChange([]);
    setOpen(false);
  }

  const summary = filterSummary(selected);

  return (
    <div className={`fh-filters-panel ${open ? "is-open" : ""}`}>
      <button
        type="button"
        className="fh-filters-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="fh-filters-body"
      >
        <span className="fh-filters-trigger-left">
          <span className="fh-filters-trigger-icon" aria-hidden>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 6h16M7 12h10M10 18h4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span className="fh-filters-trigger-text">
            <span className="fh-filters-title">Filtrar contenido</span>
            <span className="fh-filters-trigger-sub">
              {isFeaturedMode
                ? open
                  ? "Elige categorías abajo"
                  : "Pulsa para desplegar categorías"
                : summary || `${selected.length} seleccionado${selected.length !== 1 ? "s" : ""}`}
            </span>
          </span>
        </span>
        <span className="fh-filters-trigger-right">
          {!isFeaturedMode && selected.length > 0 && (
            <span className="fh-filters-badge">{selected.length}</span>
          )}
          <span className="fh-filters-chevron" aria-hidden />
        </span>
      </button>

      {!isFeaturedMode && selected.length > 0 && (
        <div className="fh-active-filters">
          {selected.map((id) => (
            <button
              key={id}
              type="button"
              className="fh-active-pill"
              data-sport={id}
              onClick={() => toggle(id)}
              title="Quitar filtro"
            >
              {sportLabel(id)} ×
            </button>
          ))}
        </div>
      )}

      <div
        id="fh-filters-body"
        className="fh-filters-body"
        hidden={!open}
      >
        {isFeaturedMode && (
          <p className="fh-filters-hint">
            Lo esencial de hoy. Elige una o varias categorías.
          </p>
        )}

        {FILTER_GROUPS.map((group) => (
          <div key={group.id} className="fh-filter-group">
            <span className="fh-filter-group-label" data-group={group.id}>
              {group.label}
            </span>
            <div className="fh-filter-chips">
              {group.options.map((opt) => {
                const on = selected.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    data-sport={opt.id}
                    className={`fh-filter-chip ${on ? "active" : ""}`}
                    onClick={() => toggle(opt.id)}
                    aria-pressed={on}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {selected.length > 0 && (
          <button type="button" className="fh-filters-clear" onClick={clearAll}>
            Ver destacados
          </button>
        )}
      </div>
    </div>
  );
}
