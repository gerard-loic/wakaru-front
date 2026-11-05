import type { ReactNode } from "react"

/** Zone de filtres d'une page de liste. Masquée quand aucune liste n'est proposée. */
export default function FilterBar({ children }: { children: ReactNode }) {
  return (
    <div className="hidden has-[select]:flex flex-wrap items-center gap-x-4 gap-y-3 mb-6">
      <span className="mono text-[11px] uppercase tracking-[0.12em] text-ember">
        Filtrer
      </span>
      {children}
    </div>
  )
}
