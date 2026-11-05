import { useState } from "react"
import { formatDate } from "@/lib/format"
import { AiNotice } from "@/components/AiNotice"
import { BackBar } from "@/components/BackBar"
import { Empty } from "@/components/Empty"
import { LevelBadge } from "@/components/Badges"
import { MasteryDot } from "@/components/Mastery"
import { wordDotLevel } from "@/features/vocab/wordModel"
import { SpeakBtn } from "@/components/SpeakBtn"
import { KanjiCard } from "@/features/kanji/KanjiCard"
import { RuleRow } from "@/features/grammar/RuleRow"
import { SentenceCard } from "@/features/sentences/SentencesView"
import { ExerciseCard } from "@/features/exercises/ExerciseCard"
import type { TrainingRequest } from "@/features/practice/training"
import type { ProgramTaskRef } from "./themeProgram"
import type { ThemeContent } from "./useTheme"
import { ExoProgress } from "./ExoProgress"
import { WeekPlan } from "./WeekPlan"

type Tab = "plan" | "vocab" | "kanji" | "grammar" | "sentences" | "exercises"

export function ThemeDetail({
  isWeekly,
  content,
  loading = false,
  error = null,
  onRetry,
  onBack,
  onOpenWord,
  onOpenKanji,
  onOpenRule,
  onOpenSentence,
  onOpenExercise,
  onRunExercise,
  onRunTraining,
}: {
  /** Thème de la semaine ? `null` tant que ce n'est pas connu. */
  isWeekly: boolean | null
  /** Thème et son contenu, `null` tant que rien n'est chargé. */
  content: ThemeContent | null
  loading?: boolean
  /** Message d'erreur à afficher à la place du thème. */
  error?: string | null
  /** Action du bouton « Réessayer » en cas d'erreur. */
  onRetry?: () => void
  onBack: () => void
  onOpenWord: (id: number) => void
  onOpenKanji: (id: number) => void
  onOpenRule: (id: number) => void
  onOpenSentence: (id: number) => void
  onOpenExercise: (id: number) => void
  onRunExercise: (id: number, task: ProgramTaskRef) => void
  onRunTraining: (request: TrainingRequest, task: ProgramTaskRef) => void
}) {
  const [tab, setTab] = useState<Tab>("plan")

  if (error) {
    return (
      <div>
        <BackBar onBack={onBack} label="Thèmes" />
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

  if (!content) {
    return (
      <div aria-busy={loading}>
        <BackBar onBack={onBack} label="Thèmes" />
        <div className="h-96 border border-line bg-panel animate-pulse mb-8" />
        <div className="h-64 border border-line bg-panel animate-pulse" />
      </div>
    )
  }

  const { theme, words, kanjis, rules, sentences, exercises } = content

  const tabs: { key: Tab; label: string; n?: number }[] = [
    { key: "plan", label: "Programme" },
    { key: "vocab", label: "Vocabulaire", n: words.length },
    { key: "kanji", label: "Kanji", n: kanjis.length },
    { key: "grammar", label: "Grammaire", n: rules.length },
    { key: "sentences", label: "Phrases", n: sentences.length },
    { key: "exercises", label: "Exercices", n: exercises.length },
  ]

  return (
    <div
      aria-busy={loading}
      className={"transition-opacity " + (loading ? "opacity-50" : "")}
    >
      <BackBar onBack={onBack} label="Thèmes" />
      <div className="relative border border-line overflow-hidden bg-ink mb-8">
        <div className="relative h-56 sm:h-72 bg-panel-2 lg:absolute lg:inset-y-0 lg:right-0 lg:h-auto lg:w-[64%]">
          {theme.image ? (
            <img
              src={theme.image}
              alt={theme.name}
              className="size-full object-cover grayscale-[25%]"
            />
          ) : (
            <div className="size-full grid place-items-center jp text-7xl text-line-bright">
              課
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 via-35% to-transparent lg:bg-gradient-to-r lg:via-ink/50 lg:via-30%" />
          {theme.imageCredit && (
            <span className="absolute bottom-2 right-3 max-w-[60%] truncate bg-ink/60 px-1.5 py-0.5 mono text-[9px] text-fog">
              © {theme.imageCredit}
            </span>
          )}
        </div>
        <div className="relative flex flex-col gap-6 p-6 lg:p-8 lg:w-[48%] lg:min-h-96">
          <div>
            <div className="mono text-[11px] uppercase tracking-[0.16em] text-ember mb-2">
              Thème{theme.date && ` · ${formatDate(theme.date)}`}
            </div>
            <h1 className="display text-4xl md:text-5xl font-900 tracking-tight mb-4">
              {theme.name}
            </h1>
            <p className="text-sm text-chalk/80 leading-relaxed whitespace-pre-line">
              {theme.description}
            </p>
          </div>
          <div className="mt-auto">
            <ExoProgress program={theme.program} />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 border-b border-line mb-6">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={
              "mono text-xs uppercase tracking-[0.08em] px-4 py-3 border-b-2 -mb-px transition-colors " +
              (tab === t.key
                ? "border-ember text-ember"
                : "border-transparent text-fog hover:text-chalk")
            }
          >
            {t.label}
            {t.n !== undefined && <span className="text-fog/70"> ({t.n})</span>}
          </button>
        ))}
      </div>

      {tab === "plan" && (
        <WeekPlan
          program={theme.program}
          isWeekly={isWeekly}
          onExercise={onRunExercise}
          onTraining={onRunTraining}
        />
      )}

      {tab === "vocab" &&
        (words.length === 0 ? (
          <div className="border border-line">
            <Empty />
          </div>
        ) : (
          <div className="border border-line divide-y divide-line">
            {words.map((w) => (
              <div
                key={w.id}
                className="flex items-center gap-4 px-4 py-3 hover:bg-panel/60 transition-colors"
              >
                <button
                  type="button"
                  onClick={() => onOpenWord(w.id)}
                  aria-haspopup="dialog"
                  className="group flex-1 min-w-0 flex items-center gap-4 text-left cursor-pointer"
                >
                  <MasteryDot level={wordDotLevel(w)} />
                  <span className="jp text-xl min-w-24 group-hover:text-ember transition-colors">
                    {w.writing}
                  </span>
                  <span className="jp text-sm text-fog min-w-24 hidden sm:block">
                    {w.reading !== w.writing ? w.reading : ""}
                  </span>
                  <span className="flex-1 text-sm">
                    {w.translations.join(", ")}
                  </span>
                  {w.level && <LevelBadge level={w.level} />}
                </button>
                <SpeakBtn text={w.reading || w.writing} />
              </div>
            ))}
          </div>
        ))}

      {tab === "kanji" &&
        (kanjis.length === 0 ? (
          <div className="border border-line">
            <Empty />
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {kanjis.map((k) => (
              <KanjiCard key={k.id} k={k} onOpen={onOpenKanji} />
            ))}
          </div>
        ))}

      {tab === "grammar" &&
        (rules.length === 0 ? (
          <div className="border border-line">
            <Empty />
          </div>
        ) : (
          <div className="space-y-3">
            {rules.map((r) => (
              <RuleRow key={r.id} rule={r} onOpen={() => onOpenRule(r.id)} />
            ))}
          </div>
        ))}

      {tab === "sentences" &&
        (sentences.length === 0 ? (
          <div className="border border-line">
            <Empty />
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {sentences.map((s) => (
              <SentenceCard
                key={s.id}
                sentence={s}
                onOpen={() => onOpenSentence(s.id)}
              />
            ))}
          </div>
        ))}

      {tab === "exercises" &&
        (exercises.length === 0 ? (
          <div className="border border-line">
            <Empty />
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {exercises.map((e) => (
              <ExerciseCard key={e.id} e={e} onOpen={onOpenExercise} />
            ))}
          </div>
        ))}
      <div className="mt-10 pt-3 border-t border-line">
        <AiNotice />
      </div>
    </div>
  )
}
