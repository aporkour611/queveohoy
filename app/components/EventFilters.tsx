"use client";

import { memo, useEffect, useState } from "react";
import {
  QUICK_FILTERS,
  formatFilterSummary,
  sportLabel,
} from "../lib/filter-config";
import { CategoryGroupsPanel } from "./CategoryGroupsPanel";
import { CategoryIcon } from "./CategoryIcon";

type Props = {
  selected: string[];
  onSearch: (ids: string[]) => void;
  isFeaturedMode: boolean;
  variant?: "panel" | "toolbar";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  searching?: boolean;
  highlightDiscover?: boolean;
};

function sameSelection(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const setB = new Set(b);
  return a.every((id) => setB.has(id));
}

export const EventFilters = memo(function EventFilters({
  selected,
  onSearch,
  isFeaturedMode,
  variant = "panel",
  open: controlledOpen,
  onOpenChange,
  searching = false,
  highlightDiscover = false,
}: Props) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [draft, setDraft] = useState(selected);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  useEffect(() => {
    setDraft(selected);
  }, [selected]);

  const setOpen = (next: boolean) => {
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  };
  const isToolbar = variant === "toolbar";
  const hasPendingChanges = !sameSelection(draft, selected);
  const canSearch = draft.length > 0 || hasPendingChanges;

  function toggle(id: string) {
    setDraft((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  function handleSearch() {
    onSearch(draft);
    setOpen(false);
  }

  function clearAll() {
    setDraft([]);
    onSearch([]);
  }

  const summary = formatFilterSummary(selected);

  function isQuickFilterActive(sportIds: string[]): boolean {
    if (sportIds.length === 0) return selected.length === 0;
    if (sportIds.length !== selected.length) return false;
    return sportIds.every((id) => selected.includes(id));
  }

  const quickFilters = (
    <div
      className={`fh-quick-filters${isToolbar ? " fh-quick-filters-toolbar" : ""}`}
      role="group"
      aria-label="Filtros rápidos"
    >
      {QUICK_FILTERS.map((quick) => (
        <button
          key={quick.id}
          type="button"
          className={`fh-quick-filter fh-quick-filter-icon ${
            isQuickFilterActive(quick.sportIds) ? "active" : ""
          }`}
          data-quick={quick.id}
          aria-pressed={isQuickFilterActive(quick.sportIds)}
          onClick={() => {
            if (quick.sportIds.length === 0) {
              clearAll();
              return;
            }
            setDraft(quick.sportIds);
          }}
        >
          <CategoryIcon id={quick.id} size={16} />
          <span>{quick.label}</span>
        </button>
      ))}
      <button
        type="button"
        className={`fh-quick-filter fh-quick-filter-more${
          open ? " active is-collapsed-target" : ""
        }${highlightDiscover ? " is-discoverable" : ""}`}
        aria-expanded={open}
        aria-controls="fh-filters-body"
        onClick={() => setOpen(!open)}
      >
        Más
        {selected.length > 0 && !isFeaturedMode ? (
          <span className="fh-quick-filter-count">{selected.length}</span>
        ) : null}
      </button>
    </div>
  );

  const searchButton = (
    <button
      type="button"
      className="fh-filters-search fh-filters-search-inline"
      onClick={handleSearch}
      disabled={searching || !canSearch}
    >
      Buscar
    </button>
  );

  const activeFilters =
    !isFeaturedMode && selected.length > 0 ? (
      <div className="fh-active-filters">
        <div className="fh-active-filters-pills">
          {selected.map((id) => (
            <button
              key={id}
              type="button"
              className="fh-active-pill fh-active-pill-icon"
              data-sport={id}
              onClick={() => {
                const next = selected.filter((item) => item !== id);
                setDraft(next);
                onSearch(next);
              }}
              title="Quitar filtro"
            >
              <CategoryIcon id={id} size={14} />
              <span>{sportLabel(id)} ×</span>
            </button>
          ))}
        </div>
        <button
          type="button"
          className="fh-filters-clear fh-filters-clear-inline"
          onClick={clearAll}
        >
          Limpiar
        </button>
        {searchButton}
      </div>
    ) : null;

  const filterBody = (
    <div
      id="fh-filters-body"
      className="fh-filters-body"
      hidden={!open}
    >
      {isFeaturedMode && (
        <p className="fh-filters-hint">
          Elige un grupo principal o afina con subgrupos. Pulsa Buscar para
          actualizar el calendario.
        </p>
      )}

      <CategoryGroupsPanel
        draft={draft}
        onToggleSport={toggle}
        onSelectGroup={setDraft}
      />

      <div className="fh-filters-actions">
        {(draft.length > 0 || selected.length > 0) && (
          <button
            type="button"
            className="fh-filters-clear"
            onClick={clearAll}
          >
            Eliminar filtros
          </button>
        )}
        <button
          type="button"
          className="fh-filters-search"
          onClick={handleSearch}
          disabled={searching || !canSearch}
        >
          Buscar
        </button>
      </div>
    </div>
  );

  if (isToolbar) {
    return (
      <div
        className={`qvh-feed-filters${open ? " is-open" : ""}${
          highlightDiscover ? " is-discoverable" : ""
        }`}
      >
        {quickFilters}
        {activeFilters}
        {draft.length > 0 && (isFeaturedMode || selected.length === 0) ? (
          <div className="fh-active-filters">{searchButton}</div>
        ) : null}
        {filterBody}
      </div>
    );
  }

  return (
    <div className={`fh-filters-panel ${open ? "is-open" : ""}`}>
      {quickFilters}

      <button
        type="button"
        className="fh-filters-trigger"
        onClick={() => setOpen(!open)}
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
                  ? "Elige categorías abajo y pulsa Buscar"
                  : "Calendario con lo más importante · pulsa para afinar"
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

      {activeFilters}
      {filterBody}
    </div>
  );
});
