"use client";

import { memo, type CSSProperties } from "react";
import {
  MAIN_CATEGORY_GROUPS,
  isMainGroupFullySelected,
  isMainGroupPartiallySelected,
  selectableSportIdsFromGroup,
  type SubgroupTile,
} from "@/app/lib/filter-groups-design";
import { CategoryIcon } from "./CategoryIcon";

type Props = {
  draft: string[];
  onToggleSport: (sportId: string) => void;
  onSelectGroup: (sportIds: string[]) => void;
};

function subgroupKey(tile: SubgroupTile, index: number): string {
  return `${tile.sportId}-${tile.label}-${index}`;
}

export const CategoryGroupsPanel = memo(function CategoryGroupsPanel({
  draft,
  onToggleSport,
  onSelectGroup,
}: Props) {
  const draftSet = new Set(draft);

  const handleMainBarClick = (groupId: string) => {
    const ids = selectableSportIdsFromGroup(groupId);
    if (ids.length === 0) return;

    if (isMainGroupFullySelected(groupId, draftSet)) {
      onSelectGroup(draft.filter((id) => !ids.includes(id)));
      return;
    }

    const merged = [...new Set([...draft, ...ids])];
    onSelectGroup(merged);
  };

  return (
    <div className="qvh-cat-groups" aria-label="Grupos y subgrupos">
      <p className="qvh-cat-groups-kicker">Grupos principales</p>

      <div className="qvh-cat-main-list">
        {MAIN_CATEGORY_GROUPS.map((group) => {
          const full = isMainGroupFullySelected(group.id, draftSet);
          const partial = isMainGroupPartiallySelected(group.id, draftSet);

          return (
            <button
              key={group.id}
              type="button"
              className={`qvh-cat-main-bar${full ? " is-active" : ""}${
                partial ? " is-partial" : ""
              }`}
              data-group={group.id}
              aria-pressed={full}
              onClick={() => handleMainBarClick(group.id)}
              style={
                {
                  "--qvh-cat-accent": group.accent,
                  "--qvh-cat-accent-soft": group.accentSoft,
                } as CSSProperties
              }
            >
              <span className="qvh-cat-main-icon" aria-hidden>
                <CategoryIcon id={group.id} size={28} color={group.accent} />
              </span>
              <span className="qvh-cat-main-copy">
                <span className="qvh-cat-main-title">{group.title}</span>
                <span className="qvh-cat-main-subtitle">{group.subtitle}</span>
              </span>
              <span className="qvh-cat-main-watermark" aria-hidden>
                {group.watermark}
              </span>
            </button>
          );
        })}
      </div>

      {MAIN_CATEGORY_GROUPS.map((group) => (
        <section
          key={`sub-${group.id}`}
          className="qvh-cat-sub-section qvh-content-auto"
          aria-labelledby={`qvh-cat-sub-${group.id}`}
        >
          <h3
            id={`qvh-cat-sub-${group.id}`}
            className="qvh-cat-sub-heading"
            style={{ color: group.accent } as CSSProperties}
          >
            Subgrupos — {group.title}
          </h3>
          <div className="qvh-cat-sub-grid">
            {group.subgroups.map((tile, index) => {
              const iconId = tile.iconId ?? tile.sportId;
              const active = !tile.disabled && draftSet.has(tile.sportId);
              const uniqueKey = subgroupKey(tile, index);

              if (tile.disabled) {
                return (
                  <div
                    key={uniqueKey}
                    className="qvh-cat-sub-tile is-disabled"
                    aria-disabled="true"
                    title={tile.disabledHint}
                    style={
                      {
                        "--qvh-cat-accent": group.accent,
                      } as CSSProperties
                    }
                  >
                    <span className="qvh-cat-sub-icon" aria-hidden>
                      <CategoryIcon id={iconId} size={36} color={group.accent} />
                    </span>
                    <span className="qvh-cat-sub-label">{tile.label}</span>
                    {tile.disabledHint ? (
                      <span className="qvh-cat-sub-badge">{tile.disabledHint}</span>
                    ) : null}
                  </div>
                );
              }

              return (
                <button
                  key={uniqueKey}
                  type="button"
                  className={`qvh-cat-sub-tile${active ? " is-active" : ""}`}
                  data-sport={tile.sportId}
                  aria-pressed={active}
                  onClick={() => onToggleSport(tile.sportId)}
                  style={
                    {
                      "--qvh-cat-accent": group.accent,
                    } as CSSProperties
                  }
                >
                  <span className="qvh-cat-sub-icon" aria-hidden>
                    <CategoryIcon id={iconId} size={36} color={group.accent} />
                  </span>
                  <span className="qvh-cat-sub-label">{tile.label}</span>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
});
