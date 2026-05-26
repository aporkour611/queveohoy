"use client";

import { FILTER_GROUPS } from "../lib/filter-config";

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
        <span className="fh-filters-title">¿Qué quieres ver?</span>
        {selected.length > 0 && (
          <button type="button" className="fh-filters-clear" onClick={clearAll}>
            Ver destacados
          </button>
        )}
      </div>

      {isFeaturedMode && (
        <p className="fh-filters-hint">
          Vista principal: los eventos más importantes de cada deporte. Elige
          abajo para ver todo lo que te interese.
        </p>
      )}

      {FILTER_GROUPS.map((group) => (
        <div key={group.id} className="fh-filter-group">
          <span className="fh-filter-group-label">{group.label}</span>
          <div className="fh-filter-chips">
            {group.options.map((opt) => {
              const on = selected.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
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
