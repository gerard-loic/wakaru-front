import { PLAN_META, WEEK_DAYS, planKind } from "@/lib/plan"
import RunTaskButton from "@/components/RunTaskButton"
import { StatusPill } from "@/components/StatusPill"
import type { TrainingRequest } from "@/features/practice/training"
import {
  programDayIndex,
  programWeekdayIndex,
  type ProgramTaskRef,
  type WeekProgram,
} from "./themeProgram"

/** Onglet « Programme » d'un thème : les tâches de chaque jour de la semaine. */
export function WeekPlan({
  program,
  isWeekly,
  onExercise,
  onTraining,
}: {
  program: WeekProgram
  /** Thème de la semaine ? `null` tant que ce n'est pas connu. */
  isWeekly: boolean | null
  onExercise: (id: number, task: ProgramTaskRef) => void
  onTraining: (request: TrainingRequest, task: ProgramTaskRef) => void
}) {
  const all = program.flat()
  const done = all.filter((t) => t.done).length
  const todayIdx = programDayIndex()

  if (all.length === 0) {
    return (
      <div className="border border-line bg-panel p-6 text-center mono text-xs text-fog">
        Aucun programme pour ce thème.
      </div>
    )
  }

  return (
    <div>
      <div className="border border-line bg-panel p-4 mb-5 flex items-center justify-between">
        <div>
          <div className="mono text-[11px] uppercase tracking-[0.12em] text-fog">
            Programme de la semaine
          </div>
          <div className="text-sm mt-1">
            {all.length} exercice{all.length > 1 ? "s" : ""} au total
          </div>
        </div>
        <div className="text-right">
          <div className="display font-900 text-2xl leading-none text-ember">
            {done}
            <span className="text-fog text-base">/{all.length}</span>
          </div>
          <div className="mono text-[10px] text-fog uppercase">effectués</div>
        </div>
      </div>

      <div className="space-y-4">
        {program.map((day, i) => {
          const isToday = i === todayIdx
          // Jours passés encore rattrapables, jours à venir verrouillés.
          const isUpcoming = i > todayIdx
          return (
            <div
              key={i}
              className={"border " + (isToday ? "border-ember" : "border-line")}
            >
              <div
                className={
                  "flex items-center gap-3 px-4 py-2.5 border-b " +
                  (isToday
                    ? "border-ember/40 bg-ember/10"
                    : "border-line bg-panel")
                }
              >
                <span className="mono text-[11px] uppercase tracking-[0.14em] text-chalk">
                  {WEEK_DAYS[programWeekdayIndex(i)]}
                </span>
                {isToday && (
                  <span className="mono text-[9px] uppercase tracking-[0.12em] text-ember border border-ember/50 px-1.5 py-0.5">
                    Aujourd'hui
                  </span>
                )}
                <span className="mono text-[10px] text-fog ml-auto">
                  {day.filter((t) => t.done).length}/{day.length}
                </span>
              </div>
              {day.length === 0 ? (
                <p className="px-4 py-3 mono text-xs text-fog">Rien de prévu.</p>
              ) : (
                <div className="divide-y divide-line">
                  {day.map((task, j) => {
                    const meta = PLAN_META[planKind(task)]
                    return (
                      <div key={j} className="flex flex-wrap items-center gap-3 px-4 py-3 [&>:last-child]:ml-auto">
                        <span
                          className="jp text-lg w-9 h-9 shrink-0 grid place-items-center border border-line text-ember"
                          title={meta.label}
                        >
                          {meta.glyph}
                        </span>
                        <div className="flex-1 min-w-32">
                          <div className="text-sm leading-snug">{task.name}</div>
                          <div className="mono text-[10px] text-fog truncate">
                            {meta.label}
                          </div>
                        </div>
                        {!task.done && isWeekly && !isUpcoming ? (
                          <RunTaskButton
                            onClick={() =>
                              task.kind === "exercise"
                                ? onExercise(task.exerciseId, task.ref)
                                : onTraining(task.request, task.ref)
                            }
                          />
                        ) : (
                          <StatusPill
                            done={task.done}
                            missed={isWeekly === false}
                            upcoming={isWeekly === true && isUpcoming}
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
