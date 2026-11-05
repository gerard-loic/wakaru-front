import { useState, type FormEvent } from "react"
import { recordAnswer } from "@/lib/knowledge"
import { resultMessage } from "@/lib/quiz"
import { SyloApiError, syloErrorMessage } from "@/lib/sylo"
import {
  EXERCISE_ENTITY,
  SUCCESS_RATE,
  blanksOf,
  isCorrect,
  type ExerciseDetail,
  type ExerciseItem,
} from "@/features/exercises/exerciseModel"
import { AnswerBlank, PromptText } from "@/features/exercises/PromptText"

export function ExerciseRunner({
  detail,
  loading = false,
  error = null,
  onRetry,
  onRecorded,
  onFinished,
  onClose,
}: {
  /** Exercice et ses questions, `null` tant que rien n'est chargé. */
  detail: ExerciseDetail | null
  loading?: boolean
  error?: string | null
  onRetry?: () => void
  /** Résultat enregistré côté API (la maîtrise de l'exercice a pu changer). */
  onRecorded?: () => void
  /** Appelé en arrivant au bilan, quel que soit le score. */
  onFinished?: () => void
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 bg-ink/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-panel border border-line max-h-[90vh] overflow-y-auto">
        {detail ? (
          // `key` : repart de zéro si l'on passe d'un exercice à l'autre.
          <Run
            key={detail.exercise.id}
            detail={detail}
            onRecorded={onRecorded}
            onFinished={onFinished}
            onClose={onClose}
          />
        ) : (
          <>
            <Header title="Exercice" subtitle={loading ? "Chargement…" : ""} onClose={onClose} />
            <div className="p-6">
              {error ? (
                <div role="alert" className="flex flex-col items-center gap-3 text-center py-6">
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
              ) : (
                <div aria-busy className="h-48 border border-line bg-ink/40 animate-pulse" />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function Header({
  title,
  subtitle,
  onClose,
}: {
  title: string
  subtitle: string
  onClose: () => void
}) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-line sticky top-0 bg-panel z-10">
      <div className="flex items-center gap-3">
        <span className="jp text-ember text-xl">練習</span>
        <div>
          <div className="display font-800 text-lg leading-none">{title}</div>
          <div className="mono text-[10px] text-fog uppercase tracking-[0.12em] mt-1">
            {subtitle}
          </div>
        </div>
      </div>
      <button
        onClick={onClose}
        aria-label="Fermer"
        className="size-8 grid place-items-center border border-line text-fog hover:border-ember hover:text-ember transition-colors"
      >
        ✕
      </button>
    </div>
  )
}

function Run({
  detail,
  onRecorded,
  onFinished,
  onClose,
}: {
  detail: ExerciseDetail
  onRecorded?: () => void
  onFinished?: () => void
  onClose: () => void
}) {
  const { exercise: e, items } = detail
  const [idx, setIdx] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [done, setDone] = useState(false)
  const total = items.length

  // Enregistrement du résultat (`user_knowledges/<id>/answer`) en fin d'exercice.
  const [knowledgeId, setKnowledgeId] = useState(e.knowledgeId)
  const [save, setSave] = useState<{ state: "saving" | "saved" | "error"; error?: string } | null>(
    null,
  )

  const record = (score: number) => {
    setSave({ state: "saving" })
    recordAnswer({
      knowledgeId,
      entityName: EXERCISE_ENTITY,
      entityId: e.id,
      success: score / total >= SUCCESS_RATE,
    })
      .then((id) => {
        // La ligne créée au premier passage sert aux suivants (« Recommencer »).
        setKnowledgeId(id)
        setSave({ state: "saved" })
        onRecorded?.()
      })
      .catch((err) =>
        setSave({
          state: "error",
          error: err instanceof SyloApiError || !(err instanceof Error) ? syloErrorMessage(err) : err.message,
        }),
      )
  }

  const next = (ok: boolean) => {
    const score = correct + (ok ? 1 : 0)
    setCorrect(score)
    if (idx + 1 >= total) {
      setDone(true)
      onFinished?.()
      record(score)
    } else setIdx((i) => i + 1)
  }

  const restart = () => {
    setIdx(0)
    setCorrect(0)
    setDone(false)
    setSave(null)
  }

  const subtitle = done
    ? "Bilan"
    : `Question ${idx + 1} / ${total}` + (e.category ? ` · ${e.category.name}` : "")

  return (
    <>
      <Header title={e.title} subtitle={total ? subtitle : ""} onClose={onClose} />
      <div className="p-6">
        {total === 0 ? (
          <p className="mono text-xs text-fog text-center py-10">
            Cet exercice ne contient encore aucune question.
          </p>
        ) : !done ? (
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="h-1 flex-1 bg-line overflow-hidden">
                <div
                  className="h-full bg-ember transition-all duration-300"
                  style={{ width: `${(idx / total) * 100}%` }}
                />
              </div>
              <span className="mono text-[11px] text-fog">
                {correct} <span className="text-ember">★</span>
              </span>
            </div>

            {e.instructions && (
              <div className="mono text-[10px] uppercase tracking-[0.12em] text-fog mb-3">
                {e.instructions}
              </div>
            )}

            <Question
              key={items[idx].id}
              number={idx + 1}
              item={items[idx]}
              choices={e.choices}
              last={idx + 1 >= total}
              onNext={next}
            />
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="mono text-[11px] uppercase tracking-[0.16em] text-ember mb-4">
              {resultMessage(correct, total).tag}
            </div>
            <div className="jp text-5xl mb-2">{resultMessage(correct, total).jp}</div>
            <div className="display font-900 text-7xl tracking-tight my-4">
              {correct}
              <span className="text-fog text-3xl">/{total}</span>
            </div>
            <div className="mono text-sm text-fog mb-2">
              {Math.round((correct / total) * 100)}% de réussite
            </div>
            <div className="mono text-[11px] uppercase tracking-[0.1em] mb-8 min-h-4" aria-live="polite">
              {save?.state === "saving" && <span className="text-fog">Enregistrement…</span>}
              {save?.state === "saved" && (
                <span className={correct / total >= SUCCESS_RATE ? "text-emerald-300" : "text-fog"}>
                  {correct / total >= SUCCESS_RATE ? "Exercice réussi ✓" : "Exercice à retravailler"}
                  {" · progression enregistrée"}
                </span>
              )}
              {save?.state === "error" && (
                <span className="text-ember">
                  {save.error}{" "}
                  <button
                    onClick={() => record(correct)}
                    className="underline underline-offset-4 hover:text-ember-soft"
                  >
                    Réessayer
                  </button>
                </span>
              )}
            </div>
            <div className="h-2 bg-line overflow-hidden mb-10 max-w-sm mx-auto">
              <div
                className="h-full bg-ember transition-all duration-700"
                style={{ width: `${(correct / total) * 100}%` }}
              />
            </div>
            <div className="flex gap-3 max-w-sm mx-auto">
              <button
                onClick={restart}
                className="mono text-xs uppercase tracking-[0.1em] flex-1 py-3 border border-line text-fog hover:border-ember hover:text-ember transition-colors"
              >
                Recommencer
              </button>
              <button
                onClick={onClose}
                className="mono text-xs uppercase tracking-[0.1em] flex-1 py-3 bg-ember text-ink font-600 hover:bg-ember-soft transition-colors"
              >
                Terminer
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

/**
 * Une question : l'utilisateur remplit chaque trou (choix proposés ou
 * saisie libre), valide, puis voit la correction avant de passer à la suite.
 */
function Question({
  number,
  item,
  choices,
  last,
  onNext,
}: {
  number: number
  item: ExerciseItem
  /** Réponses proposées ; vide = saisie libre. */
  choices: string[]
  last: boolean
  onNext: (ok: boolean) => void
}) {
  const blanks = blanksOf(item)
  const [given, setGiven] = useState<Record<number, string>>({})
  // Trou que remplira le prochain choix cliqué.
  const [active, setActive] = useState<number | null>(blanks[0]?.key ?? null)
  const [checked, setChecked] = useState(false)

  const results = blanks.map((b) => isCorrect(given[b.key] ?? "", b.answers))
  const ok = results.every(Boolean)
  const complete = blanks.every((b) => (given[b.key] ?? "").trim() !== "")

  const pick = (choice: string) => {
    if (checked || active == null) return
    const filled = { ...given, [active]: choice }
    setGiven(filled)
    setActive(blanks.find((b) => !filled[b.key])?.key ?? active)
  }

  const submit = (ev: FormEvent) => {
    ev.preventDefault()
    if (!checked) {
      if (complete) setChecked(true)
    } else {
      onNext(ok)
    }
  }

  const blankState = (key: number) => {
    if (!checked) return "border-line-bright"
    return results[blanks.findIndex((b) => b.key === key)]
      ? "border-emerald-500 text-emerald-300"
      : "border-red-500 text-red-300"
  }

  return (
    <form onSubmit={submit}>
      <div className="text-center py-8 mb-6 border border-line bg-ink/40 relative">
        <span className="absolute top-3 left-3 num text-ember text-sm">
          {String(number).padStart(2, "0")}
        </span>
        <PromptText
          className="text-3xl px-10"
          parts={item.parts}
          renderBlank={(b) =>
            choices.length > 0 ? (
              <button
                type="button"
                disabled={checked}
                onClick={() =>
                  given[b.key] && active === b.key
                    ? setGiven(({ [b.key]: _, ...rest }) => rest)
                    : setActive(b.key)
                }
                className={
                  "inline-block min-w-[2em] mx-1 px-1 border-b-2 align-baseline transition-colors " +
                  blankState(b.key) +
                  (!checked && active === b.key ? " border-ember bg-ember/10" : "")
                }
              >
                {given[b.key] || " "}
              </button>
            ) : (
              <input
                value={given[b.key] ?? ""}
                onChange={(ev) => setGiven((g) => ({ ...g, [b.key]: ev.target.value }))}
                readOnly={checked}
                autoFocus={b.key === blanks[0].key}
                aria-label={`Trou ${b.key}`}
                size={Math.max(3, (given[b.key] ?? "").length + 1, ...b.answers.map((a) => a.length + 1))}
                className={
                  "jp mx-1 px-1 bg-transparent border-b-2 text-center outline-none focus:border-ember align-baseline " +
                  blankState(b.key)
                }
              />
            )
          }
        />
        {item.translation && (
          <p className="text-sm text-fog mt-3 px-6">{item.translation}</p>
        )}
      </div>

      {choices.length > 0 && !checked && (
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          {choices.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => pick(c)}
              className="jp text-2xl min-w-14 px-4 py-2.5 border border-line hover:border-ember hover:text-ember transition-colors"
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {checked && (
        <div
          className={
            "border-l-2 pl-4 py-2 mb-6 bg-ink/40 " +
            (ok ? "border-emerald-500" : "border-red-500")
          }
        >
          <div
            className={
              "mono text-[10px] uppercase tracking-[0.12em] mb-1 " +
              (ok ? "text-emerald-300" : "text-red-300")
            }
          >
            {ok ? "Bonne réponse ✓" : "Correction"}
          </div>
          {!ok && (
            <PromptText
              className="text-lg"
              parts={item.parts}
              renderBlank={(b) => <AnswerBlank answers={b.answers} />}
            />
          )}
          {item.explanation && (
            <p className="text-sm text-chalk/80 mt-1">{item.explanation}</p>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={!checked && !complete}
        className="mono text-sm uppercase tracking-[0.1em] w-full py-3.5 border border-ember text-ember font-600 hover:bg-ember hover:text-ink transition-colors disabled:opacity-40 disabled:pointer-events-none"
      >
        {!checked ? "Valider" : last ? "Voir le bilan →" : "Question suivante →"}
      </button>
    </form>
  )
}
