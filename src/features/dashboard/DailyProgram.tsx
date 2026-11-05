import RunTaskButton from "@/components/RunTaskButton"
import { StatusPill } from "@/components/StatusPill"
import type { TrainingRequest } from "@/features/practice/training"
import type {
  ProgramTask,
  ProgramTaskRef,
} from "@/features/themes/themeProgram"
import { PLAN_META, WEEK_DAYS, planKind } from "@/lib/plan"

/** Colonne « Ton programme du jour » : les tâches du jour et leur lancement. */
export default function DailyProgram({
  tasks,
  loading,
  error,
  onExercise,
  onTraining,
}: {
  /** Tâches du jour, `null` tant que le thème n'est pas chargé. */
  tasks: ProgramTask[] | null
  loading: boolean
  error: boolean
  onExercise: (id: number, task: ProgramTaskRef) => void
  onTraining: (request: TrainingRequest, task: ProgramTaskRef) => void
}) {
  const weekday = WEEK_DAYS[(new Date().getDay() + 6) % 7] // lundi = 0

  return (
    <div className="border-t xl:border-t-0 xl:border-l border-line p-4 sm:p-6 bg-panel flex flex-col">
      <div className="flex items-baseline justify-between mb-4">
        <div className="mono text-[11px] uppercase tracking-[0.14em] text-fog">
          Ton programme du jour
        </div>
        <div className="display font-800 text-lg text-ember leading-none">
          {weekday}
        </div>
      </div>
      {error ? (
        <p className="mono text-xs text-fog">Programme indisponible.</p>
      ) : !tasks?.length && loading ? (
        <div aria-busy className="space-y-3 flex-1">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="h-16 border border-line bg-ink/40 animate-pulse" />
          ))}
        </div>
      ) : !tasks?.length ? (
        <p className="mono text-xs text-fog">
          Rien de prévu pour aujourd'hui.
        </p>
      ) : (
        <div className="space-y-3 flex-1">
          {tasks.map((t, i) => {
            const meta = PLAN_META[planKind(t)]
            return (
              <div
                key={i}
                className="border border-line p-3 flex flex-wrap items-center gap-3 bg-ink/40 [&>:last-child]:ml-auto"
              >
                <span
                  className="jp text-lg w-9 h-9 shrink-0 grid place-items-center border border-line text-ember"
                  title={meta.label}
                >
                  {meta.glyph}
                </span>
                <div className="flex-1 min-w-32">
                  <div className="text-sm leading-snug">{t.name}</div>
                  <div className="mono text-[10px] text-fog truncate">
                    {meta.label}
                  </div>
                </div>
                {t.done ? (
                  <StatusPill done />
                ) : (
                  <RunTaskButton
                    onClick={() =>
                      t.kind === "exercise"
                        ? onExercise(t.exerciseId, t.ref)
                        : onTraining(t.request, t.ref)
                    }
                  />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
