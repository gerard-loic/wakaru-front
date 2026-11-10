import { today } from "@/lib/format"
import type { Remote } from "@/lib/useRemote"
import type { TrainingRequest } from "@/features/practice/training"
import type { ThemeEntry } from "@/features/themes/themeModel"
import {
  programDayIndexSince,
  type ProgramTaskRef,
} from "@/features/themes/themeProgram"
import type { ItemStats } from "@/layout/useItemStats"
import DailyProgram from "./DailyProgram"
import WeeklyTheme from "./WeeklyTheme"
import { STATUS } from "./status"
import StatPanels from "./StatPanels"
import PauseSuggestion from "./PauseSuggestion"
import VacationBanner from "./VacationBanner"

export function DashboardView({
  firstName,
  onVacation,
  onVacationChange,
  weeklyTheme,
  itemStats,
  onOpenTheme,
  onExercise,
  onTraining,
}: {
  /** Prénom de l'utilisateur connecté, absent tant qu'il n'est pas chargé. */
  firstName?: string
  /**
   * Mode vacances : bandeau pour repasser en actif si `true`, proposition de
   * pause en bas de page si `false`. `null` tant que l'utilisateur n'est pas chargé.
   */
  onVacation: boolean | null
  /** Appelé une fois le mode vacances activé ou désactivé depuis le tableau de bord. */
  onVacationChange: () => void
  weeklyTheme: Remote<ThemeEntry | null>
  itemStats: Remote<ItemStats>
  onOpenTheme: (id: number) => void
  onExercise: (id: number, task: ProgramTaskRef) => void
  onTraining: (request: TrainingRequest, task: ProgramTaskRef) => void
}) {
  return (
    <div>
      <div className="flex items-end justify-between border-b border-line pb-5 mb-6">
        <div className="flex items-end gap-4">
          <div>
            <div className="jp text-fog text-sm mb-1">ダッシュボード</div>
            <h1 className="display text-3xl sm:text-4xl font-800 tracking-tight leading-none">
              {firstName ? `Bonjour, ${firstName}` : "Bonjour"}
            </h1>
          </div>
        </div>
        <span className="mono text-xs text-fog mb-1 hidden sm:block">
          {today()}
        </span>
      </div>

      {/* Weekly theme banner */}
      <section className="border border-line overflow-hidden mb-8">
        <div className="grid xl:grid-cols-[1.4fr_1fr]">
          <WeeklyTheme
            theme={weeklyTheme.data}
            loading={weeklyTheme.loading}
            error={weeklyTheme.error}
            onRetry={weeklyTheme.reload}
            onOpen={onOpenTheme}
          />

          <DailyProgram
            tasks={weeklyTheme.data?.program[programDayIndexSince(weeklyTheme.data.date)] ?? null}
            loading={weeklyTheme.loading}
            error={weeklyTheme.error != null}
            onExercise={onExercise}
            onTraining={onTraining}
          />
        </div>
      </section>

      {onVacation === true && <VacationBanner onResumed={onVacationChange} />}

      {/* General statistics */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <span className="mono text-[11px] uppercase tracking-[0.14em] text-ember">
            Statistiques générales
          </span>
          <div className="h-px flex-1 bg-line" />
        </div>

        {/* legend */}
        <div className="flex flex-wrap gap-x-5 gap-y-2 mb-4">
          {(["known", "learning", "hard", "rest"] as const).map((k) => (
            <div key={k} className="flex items-center gap-2">
              <span
                className="size-3"
                style={{ background: STATUS[k].color }}
              />
              <span className="mono text-[10px] uppercase tracking-[0.08em] text-fog">
                {STATUS[k].label}
              </span>
            </div>
          ))}
        </div>

        <StatPanels
          stats={itemStats.data}
          loading={itemStats.loading}
          error={itemStats.error}
          onRetry={itemStats.reload}
        />
      </section>

      {onVacation === false && <PauseSuggestion onPaused={onVacationChange} />}
    </div>
  )
}
