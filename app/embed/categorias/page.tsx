import type { CSSProperties } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { CategoryIcon } from "@/app/components/CategoryIcon"
import { MAIN_CATEGORY_GROUPS } from "@/app/lib/filter-groups-design"
import { buildFilterSearch } from "@/app/lib/filter-url"
import { siteBrand, siteUrl } from "@/app/lib/seo"
import "../../category-groups.css"
import "../embed.css"

export const metadata: Metadata = {
  title: "Categorías — widget embed",
  robots: { index: false, follow: false },
}

export default function EmbedCategoriasPage() {
  return (
    <div className="qvh-embed qvh-embed-categorias">
      <header className="qvh-embed-head">
        <p className="qvh-embed-kicker">Explorar</p>
        <h1 className="qvh-embed-title">
          <Link href="/explorar" target="_blank" rel="noopener noreferrer">
            {siteBrand}
          </Link>
        </h1>
      </header>

      <ul className="qvh-embed-cat-list">
        {MAIN_CATEGORY_GROUPS.map((group) => {
          const ids = group.subgroups
            .filter((tile) => !tile.disabled)
            .map((tile) => tile.sportId)
          const href = `${siteUrl}/${buildFilterSearch(ids)}`

          return (
            <li key={group.id} className="qvh-embed-cat-item">
              <Link
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="qvh-embed-cat-link"
                style={
                  {
                    "--qvh-cat-accent": group.accent,
                  } as CSSProperties
                }
              >
                <CategoryIcon id={group.id} size={24} color={group.accent} />
                <span>{group.title}</span>
              </Link>
            </li>
          )
        })}
      </ul>

      <footer className="qvh-embed-foot">
        <Link href={`${siteUrl}/explorar`} target="_blank" rel="noopener noreferrer">
          Abrir explorador completo →
        </Link>
      </footer>
    </div>
  )
}
