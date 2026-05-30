let filterCssRequested = false

/** Carga category-groups.css antes de abrir el panel (menos jank al hidratar). */
export function preloadFilterPanelCss(): void {
  if (filterCssRequested || typeof window === "undefined") return
  filterCssRequested = true
  void import("@/app/category-groups.css")
}

export function bindFilterCssIntent(root: ParentNode = document): () => void {
  if (typeof window === "undefined") return () => {}

  const onIntent = (event: Event) => {
    const target = event.target
    if (!(target instanceof Element)) return
    if (!target.closest("[data-qvh-filter-intent]")) return
    preloadFilterPanelCss()
  }

  root.addEventListener("pointerenter", onIntent, { capture: true, passive: true })
  root.addEventListener("focusin", onIntent, { capture: true })

  return () => {
    root.removeEventListener("pointerenter", onIntent, { capture: true })
    root.removeEventListener("focusin", onIntent, { capture: true })
  }
}
