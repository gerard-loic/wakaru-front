import { formatDate } from "@/lib/format"
import { LevelBadge } from "@/components/Badges"
import { MasteryDot } from "@/components/Mastery"
import type { ExerciseEntry } from "@/features/exercises/exerciseModel"

export function ExerciseCard({
  e,
  onOpen,
}: {
  e: ExerciseEntry
  onOpen: (id: number) => void
}) {
  return (
    <button
      onClick={() => onOpen(e.id)}
      className="group text-left border border-line bg-panel hover:border-ember transition-colors p-4 flex flex-col"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="mono text-[10px] uppercase tracking-[0.12em] text-ember">
          {e.category?.name}
        </span>
        <span className="mono text-[10px] text-fog">{e.date && formatDate(e.date)}</span>
      </div>
      <div className="flex items-center gap-2.5 mt-2">
        <MasteryDot level={e.mastery} />
        <h3 className="text-base group-hover:text-ember transition-colors">
          {e.title}
        </h3>
      </div>
      {e.instructions && (
        <p className="text-xs text-fog mt-1 line-clamp-2">{e.instructions}</p>
      )}
      <div className="mono text-[10px] text-fog mt-3 flex items-center gap-2">
        {e.level && <LevelBadge level={e.level} />}
        <span className="text-ember ml-auto transition-transform group-hover:translate-x-1">
          →
        </span>
      </div>
    </button>
  )
}
