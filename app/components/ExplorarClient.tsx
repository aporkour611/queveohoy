"use client"

import { memo, useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { CategoryGroupsPanel } from "./CategoryGroupsPanel"
import { formatFilterSummary } from "@/app/lib/filter-config"
import { buildFilterSearch } from "@/app/lib/filter-url"

export const ExplorarClient = memo(function ExplorarClient() {
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
    const query = buildFilterSearch(draft)
    router.push(`/${query}`)
  }, [draft, router])

  const summary = formatFilterSummary(draft)

  return (
    <div className="qvh-explorar">
      <header className="qvh-explorar-head">
        <p className="qvh-explorar-kicker">Producto · v11</p>
        <h1>Explorar categorías</h1>
        <p className="qvh-explorar-lead">
          Elige grupos neon y abre la agenda con tus filtros aplicados. Diseño
          aprobado en v10, experiencia dedicada en v11.
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
