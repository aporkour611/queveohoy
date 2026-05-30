"use client"

type Props = {
  active: boolean
  disabled?: boolean
  onChange: (active: boolean) => void
}

export function PlatformFilterToggle({ active, disabled = false, onChange }: Props) {
  return (
    <button
      type="button"
      className={`qvh-platform-filter${active ? " qvh-platform-filter-active" : ""}`}
      aria-pressed={active}
      disabled={disabled}
      onClick={() => onChange(!active)}
      title={
        disabled
          ? "Configura plataformas en tu cuenta"
          : "Mostrar solo eventos en tus plataformas"
      }
    >
      <span className="qvh-platform-filter-icon" aria-hidden>
        ◉
      </span>
      <span className="qvh-platform-filter-label">Solo mis plataformas</span>
    </button>
  )
}
