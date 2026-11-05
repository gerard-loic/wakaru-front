import { programProgress, type WeekProgram } from "./themeProgram"

/** Barre d'avancement du programme d'un thème. */
export function ExoProgress({
  program,
  compact = false,
}: {
  program: WeekProgram
  compact?: boolean
}) {
  const { done, total, percent } = programProgress(program)
  const complete = total > 0 && done === total
  return (
    <div className={compact ? "" : "w-full"}>
      <div className="flex items-center justify-between mono text-[10px] uppercase tracking-[0.08em] text-fog mb-1.5">
        <span>Exercices</span>
        {total > 0 ? (
          <span className={complete ? "text-emerald-300" : "text-ember"}>
            {percent}% · {done}/{total} faits
          </span>
        ) : (
          <span>Aucun programme</span>
        )}
      </div>
      <div className="h-1.5 bg-line overflow-hidden">
        <div
          className={
            "h-full transition-all duration-500 " +
            (complete ? "bg-emerald-400" : "bg-ember")
          }
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
