/** Bouton de filtre à bascule (catégorie, nature…). */
export function FilterChip({
  label,
  title,
  count,
  active,
  onClick,
}: {
  label: string
  title?: string
  count?: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-pressed={active}
      className={
        "mono text-[11px] uppercase tracking-[0.08em] px-3 py-1.5 border transition-colors cursor-pointer " +
        (active
          ? "bg-ember border-ember text-ink"
          : "border-line text-fog hover:border-line-bright hover:text-chalk")
      }
    >
      {label}
      {count != null && <span className="opacity-60"> {count}</span>}
    </button>
  )
}
