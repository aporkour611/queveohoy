"use client";

import { FILTER_GROUPS } from "../lib/filter-config";
import { sportLabel } from "../lib/filter-config";

type Props = {
  selected: string[];
  onChange: (ids: string[]) => void;
  isFeaturedMode: boolean;
};

export function EventFilters({ selected, onChange, isFeaturedMode }: Props) {
  function toggle(id: string) {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  }

  function clearAll() {
    onChange([]);
  }

  return (
    <div className="fh-filters-panel">
      <div className="fh-filters-head">
        <div>
          <span className="fh-filters-title">¿Qué quieres ver?</span>
          {!isFeaturedMode && (
            <span className="fh-filters-active-count">
              {selected.length} seleccionado{selected.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        {selected.length > 0 && (
          <button type="button" className="fh-filters-clear" onClick={clearAll}>
            Ver destacados
          </button>
        )}
      </div>

      {isFeaturedMode ? (
        <p className="fh-filters-hint">
          Lo esencial de hoy. Filtra abajo para ver más eventos.
        </p>
      ) : (
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
    </div>
  );
}
