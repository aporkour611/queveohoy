import { CategoryIcon } from "./CategoryIcon"

type Props = {
  title: string
  iconId: string
  count?: number
}

export function CategorySectionHeader({ title, iconId, count }: Props) {
  return (
    <>
      <CategoryIcon id={iconId} size={22} className="fh-comp-header-icon" />
      <h3>{title}</h3>
      {count != null ? (
        <span className="fh-comp-count">{count}</span>
      ) : null}
    </>
  )
}
