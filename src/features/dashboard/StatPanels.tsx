import { useMemo } from "react"
import type { ItemStats } from "@/layout/useItemStats"
import { StatCard } from "./StatCard"
import { toStatPanels } from "./statPanels"

/** Grille des panneaux de statistiques, avec ses états de chargement et d'erreur. */
export default function StatPanels({
  stats,
  loading,
  error,
  onRetry,
}: {
  stats: ItemStats
  loading: boolean
  error: string | null
  onRetry: () => void
}) {
  const panels = useMemo(() => toStatPanels(stats), [stats])

  if (error) {
    return (
      <div
        role="alert"
        className="border border-ember/40 bg-ember/5 px-4 py-6 flex flex-col items-center gap-3 text-center"
      >
        <p className="mono text-xs text-ember">{error}</p>
        <button
          onClick={onRetry}
          className="mono text-xs uppercase tracking-[0.1em] text-ember hover:text-ember-soft underline underline-offset-4"
        >
          Réessayer
        </button>
      </div>
    )
  }

  if (loading && panels.length === 0) {
    return (
      <div aria-busy className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-44 border border-line bg-panel animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {panels.map((s) => (
        <StatCard key={s.id} s={s} />
      ))}
    </div>
  )
}
