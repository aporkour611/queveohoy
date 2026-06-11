"use client"

import { memo, useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { CategoryGroupsPanel } from "./CategoryGroupsPanel"
import { formatFilterSummary } from "@/app/lib/filter-config"
import { buildWeekViewHomeUrl, buildWeekViewHomeUrlWithFilters } from "@/app/lib/filter-url"

export const ExplorarClient = memo(function ExplorarClient({
  weekEventCount = 0,
}: {
  weekEventCount?: number
}) {
  const router = useRouter()
  const [draft, setDraft] = useState<string[]>([])

  const handleToggleSport = useCallback((sportId: string) => {
    setDraft((prev) =>
      prev.includes(sportId)
        ? prev.filter((id) => id !== sportId)
        : [...prev, sportId]
    )
  }, [])

  const handleSelectGroup = useCallback((sportIds: string[]) => {
    setDraft(sportIds)
  }, [])

  const handleApply = useCallback(() => {
    if (draft.length === 0) {
      router.push(buildWeekViewHomeUrl())
      return
    }
    router.push(buildWeekViewHomeUrlWithFilters(draft))
  }, [draft, router])

  const summary = formatFilterSummary(draft)

  return (
    <div className="qvh-explorar">
      <header className="qvh-explorar-head">
        <p className="qvh-explorar-kicker">Agenda · semana precargada</p>
        <h1>Explorar categorías</h1>
        <p className="qvh-explorar-lead">
          Elige grupos neon y abre la agenda con tus filtros aplicados.
          {weekEventCount > 0 ? (
            <>
              {" "}
              <strong>{weekEventCount} eventos</strong> esta semana en agenda.
            </>
          ) : null}
        </p>
      </header>

      <CategoryGroupsPanel
        draft={draft}
        onToggleSport={handleToggleSport}
        onSelectGroup={handleSelectGroup}
      />

      <div className="qvh-explorar-actions">
        {summary ? (
          <p className="qvh-explorar-summary" aria-live="polite">
            Selección: <strong>{summary}</strong>
          </p>
        ) : (
          <p className="qvh-explorar-summary qvh-explorar-summary-muted">
            Sin filtros — verás la agenda destacada completa.
          </p>
        )}
        <button
          type="button"
          className="fh-btn fh-btn-primary qvh-explorar-cta"
          onClick={handleApply}
        >
          Ver en la agenda
        </button>
      </div>
    </div>
  )
})
