import { useState } from "react"
import { formatDate } from "@/lib/format"
import { AiNotice } from "@/components/AiNotice"
import { BackBar } from "@/components/BackBar"
import { Empty } from "@/components/Empty"
import { MasteryDot } from "@/components/Mastery"
import { MASTERY_META } from "@/lib/mastery"
import { LevelBadge, ThemeTag } from "@/components/Badges"
import type { ExerciseDetail as Detail } from "@/features/exercises/exerciseModel"
import { AnswerBlank, EmptyBlank, PromptText } from "@/features/exercises/PromptText"

export function ExerciseDetail({
  detail,
  loading = false,
  error = null,
  onRetry,
  onBack,
  onRun,
}: {
  /** Exercice et ses questions, `null` tant que rien n'est chargé. */
  detail: Detail | null
  loading?: boolean
  /** Message d'erreur à afficher à la place de l'exercice. */
  error?: string | null
  /** Action du bouton « Réessayer » en cas d'erreur. */
  onRetry?: () => void
  onBack: () => void
  onRun: (id: number) => void
}) {
  const [revealed, setRevealed] = useState<Record<number, boolean>>({})

  if (error) {
    return (
      <div>
        <BackBar onBack={onBack} label="Exercices" />
        <div
          role="alert"
          className="border border-ember/40 bg-ember/5 px-4 py-6 flex flex-col items-center gap-3 text-center"
        >
          <p className="mono text-xs text-ember">{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mono text-xs uppercase tracking-[0.1em] text-ember hover:text-ember-soft underline underline-offset-4"
            >
              Réessayer
            </button>
          )}
        </div>
      </div>
    )
  }

  if (!detail) {
    return (
      <div aria-busy={loading}>
        <BackBar onBack={onBack} label="Exercices" />
        <div className="max-w-3xl">
          <div className="h-12 max-w-md bg-panel animate-pulse mb-6" />
          <div className="h-20 border border-line bg-panel animate-pulse mb-8" />
          <div className="space-y-4">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="h-24 border border-line bg-panel animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const { exercise: e, items } = detail

  return (
    <div
      aria-busy={loading}
      className={"transition-opacity " + (loading ? "opacity-50" : "")}
    >
      <BackBar onBack={onBack} label="Exercices" />
      <div className="max-w-3xl">
        <div className="flex items-center gap-3 mono text-[11px] uppercase tracking-[0.16em] mb-2">
          {e.category && <span className="text-ember">{e.category.name}</span>}
          {e.category && e.date && <span className="text-line-bright">·</span>}
          {e.date && <span className="text-fog">{formatDate(e.date)}</span>}
        </div>
        <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
          <h1 className="display text-4xl font-900 tracking-tight">{e.title}</h1>
          <button
            onClick={() => onRun(e.id)}
            disabled={items.length === 0}
            className="mono text-xs uppercase tracking-[0.1em] px-4 py-2.5 bg-ember text-ink font-600 hover:bg-ember-soft transition-colors flex items-center gap-2 shrink-0 disabled:opacity-40 disabled:pointer-events-none"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
            Lancer l'exercice
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="flex items-center gap-1.5">
            <MasteryDot level={e.mastery} />
            <span className="mono text-[10px] uppercase tracking-[0.1em] text-fog">
              {MASTERY_META[e.mastery].label}
            </span>
          </span>
          {e.level && <LevelBadge level={e.level} />}
          {e.theme && <ThemeTag name={e.theme.name} id={e.theme.id} />}
        </div>
        {(e.instructions || e.choices.length > 0) && (
          <div className="border border-line bg-panel p-4 mb-8">
            <div className="mono text-[10px] uppercase tracking-[0.12em] text-fog mb-1">
              Consigne
            </div>
            {e.instructions && <p className="text-sm">{e.instructions}</p>}
            {e.choices.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {e.choices.map((c) => (
                  <span key={c} className="jp text-base px-3 py-1 border border-line">
                    {c}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {items.length === 0 ? (
          <div className="border border-line">
            <Empty />
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item, i) => {
              const open = revealed[item.id]
              return (
                <div key={item.id} className="border border-line">
                  <div className="flex items-start gap-4 p-4">
                    <span className="num text-ember text-sm">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="flex-1">
                      <PromptText
                        parts={item.parts}
                        renderBlank={() => <EmptyBlank />}
                        className="text-xl"
                      />
                      {item.translation && (
                        <p className="text-sm text-fog mt-1">{item.translation}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setRevealed((r) => ({ ...r, [item.id]: !r[item.id] }))}
                    className="mono text-[11px] uppercase tracking-[0.1em] w-full text-left px-4 py-2.5 border-t border-line text-fog hover:text-ember transition-colors"
                  >
                    {open ? "▾ Masquer la correction" : "▸ Afficher la correction"}
                  </button>
                  {open && (
                    <div className="px-4 pb-4 pt-1 bg-panel">
                      <PromptText
                        parts={item.parts}
                        renderBlank={(b) => <AnswerBlank answers={b.answers} />}
                        className="text-base"
                      />
                      {item.explanation && (
                        <p className="text-sm text-chalk/80 mt-2">{item.explanation}</p>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
      <div className="mt-10 pt-3 border-t border-line">
        <AiNotice />
      </div>
    </div>
  )
}
