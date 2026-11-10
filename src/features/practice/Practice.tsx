import { useEffect, useRef, useState, type ReactNode } from "react"
import { resultMessage, type QType } from "@/lib/quiz"
import { SyloApiError, syloErrorMessage } from "@/lib/sylo"
import {
  SUBJECT_BY_QTYPE,
  useTrainingConfiguration,
  type TrainingElement,
  type TrainingFocus,
  type TrainingMode,
} from "@/features/practice/useTrainingConfiguration"
import {
  fetchTraining,
  isCorrect,
  recordTrainingSuccesses,
  type TrainingItem,
  type TrainingRequest,
  type TrainingText,
} from "@/features/practice/training"
import PracticeIcon from "@/features/practice/PracticeIcon"

/** Glyphe décoratif par sujet (repli : 練習). */
const SUBJECT_JP: Record<string, string> = {
  words: "単語",
  kanjis: "漢字",
  hiraganas: "ひらがな",
  katakanas: "カタカナ",
  sentences: "例文",
  mix: "混合",
}

const ELEMENT_JP: Record<TrainingElement, string> = {
  french: "仏",
  char: "字",
  reading: "読",
}

function modeJp(mode: TrainingMode): string {
  return `${ELEMENT_JP[mode.element_from] ?? "?"} → ${mode.element_to
    .map((e) => ELEMENT_JP[e] ?? "?")
    .join(" · ")}`
}

/** Contient des kana ou des kanjis : affiché avec la police japonaise. */
function isJp(text: string): boolean {
  return /[぀-ヿ㐀-鿿ｦ-ﾟ]/.test(text)
}

type Step = "subject" | "mode" | "focus" | "quiz" | "result"

export function Practice({
  onClose,
  onRecorded,
  onFinished,
  initialType,
  preset,
}: {
  onClose: () => void
  /** Appelé une fois les réussites enregistrées (rafraîchit les maîtrises). */
  onRecorded?: () => void
  /** Appelé en arrivant au bilan, quel que soit le score. */
  onFinished?: () => void
  initialType?: QType
  /** Lance directement cet entraînement, sans passer par les étapes de choix. */
  preset?: TrainingRequest
}) {
  const { subjects, loading, error, reload } = useTrainingConfiguration()
  const initialSubject =
    preset?.subject ?? (initialType ? SUBJECT_BY_QTYPE[initialType] : undefined)
  const [step, setStep] = useState<Step>(
    preset ? "quiz" : initialSubject ? "mode" : "subject",
  )
  const [subjectUid, setSubjectUid] = useState<string | null>(
    initialSubject ?? null,
  )
  const [mode, setMode] = useState<TrainingMode | null>(
    preset
      ? {
          name: "",
          element_from: preset.element_from,
          element_to: preset.element_to,
        }
      : null,
  )
  const [focus, setFocus] = useState<TrainingFocus | null>(
    preset ? { name: "", focus: preset.focus } : null,
  )

  // Chargement des questions (`POST /training`).
  const [quizLoading, setQuizLoading] = useState(!!preset)
  const [quizError, setQuizError] = useState<string | null>(null)
  const [items, setItems] = useState<TrainingItem[]>([])
  const [idx, setIdx] = useState(0)
  const [stage, setStage] = useState(0) // index de la question dans l'item
  const [picked, setPicked] = useState<number | null>(null) // index de la proposition
  const [revealed, setRevealed] = useState(false)
  const [itemOk, setItemOk] = useState(true) // toutes les étapes de l'item justes
  const [succeeded, setSucceeded] = useState<TrainingItem[]>([])
  const [save, setSave] = useState<{
    state: "saving" | "saved" | "error"
    error?: string
    /** Éléments réussis sans `user_knowledge`, donc non enregistrés. */
    skipped?: number
  } | null>(null)

  const subject = subjects.find((s) => s.subject === subjectUid) ?? null
  // Sujet présélectionné absent de la configuration : on repart du choix du sujet.
  const view: Step =
    (step === "mode" || step === "focus") && !subject && !loading
      ? "subject"
      : step
  const configStep = view === "subject" || view === "mode" || view === "focus"

  const item = items[idx]
  const question = item?.questions[stage]
  const multiStage = (item?.questions.length ?? 0) > 1
  const pickedProp = picked != null ? question?.propositions[picked] : null
  const score = succeeded.length

  const start = (f: TrainingFocus) => {
    setFocus(f)
    setStep("quiz")
    setQuizLoading(true)
    setQuizError(null)
    setItems([])
    setIdx(0)
    setStage(0)
    setPicked(null)
    setRevealed(false)
    setItemOk(true)
    setSucceeded([])
    setSave(null)
    fetchTraining({
      subject: subjectUid!,
      element_from: mode!.element_from,
      element_to: mode!.element_to,
      focus: f.focus,
    })
      .then((loaded) => {
        setItems(loaded)
        if (loaded.length === 0)
          setQuizError("Aucune question disponible pour ce choix.")
      })
      .catch((err) => setQuizError(syloErrorMessage(err)))
      .finally(() => setQuizLoading(false))
  }

  // Le ref évite un second tirage de questions (double effet du StrictMode).
  const presetStarted = useRef(false)
  useEffect(() => {
    if (!focus || !preset || presetStarted.current) return
    presetStarted.current = true
    start(focus)
    // Lancement unique à l'ouverture.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const pick = (i: number) => {
    if (picked != null) return
    setPicked(i)
    if (!isCorrect(item, question.propositions[i])) setItemOk(false)
  }

  const finish = (ok: TrainingItem[]) => {
    setStep("result")
    onFinished?.()
    if (ok.length === 0) return
    setSave({ state: "saving" })
    recordTrainingSuccesses(ok)
      .then(({ skipped }) => {
        setSave({ state: "saved", skipped })
        onRecorded?.()
      })
      .catch((err) =>
        setSave({
          state: "error",
          error:
            err instanceof SyloApiError || !(err instanceof Error)
              ? syloErrorMessage(err)
              : err.message,
        }),
      )
  }

  const next = () => {
    setPicked(null)
    setRevealed(false)
    // étape suivante de la même question
    if (stage + 1 < item.questions.length) {
      setStage((s) => s + 1)
      return
    }
    const ok = itemOk ? [...succeeded, item] : succeeded
    setSucceeded(ok)
    setStage(0)
    setItemOk(true)
    if (idx + 1 >= items.length) finish(ok)
    else setIdx((i) => i + 1)
  }

  const reset = () => {
    setStep("subject")
    setSubjectUid(null)
    setMode(null)
    setFocus(null)
    setItems([])
  }

  return (
    <div className="fixed inset-0 z-50 bg-ink/90 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-2xl bg-panel border border-line max-h-full sm:max-h-[90dvh] overflow-y-auto">
        {/* header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-line sticky top-0 bg-panel z-10">
          <div className="flex items-center gap-3">
            <span className="jp text-ember text-xl shrink-0">練習</span>
            <div>
              <div className="display font-800 text-lg leading-none">
                M'exercer
              </div>
              <div className="mono text-[10px] text-fog uppercase tracking-[0.12em] mt-1">
                {view === "subject" && "Étape 1 / 3 · Sujet"}
                {view === "mode" && "Étape 2 / 3 · Sens"}
                {view === "focus" && "Étape 3 / 3 · Focus"}
                {view === "quiz" &&
                  (items.length > 0
                    ? `Question ${idx + 1} / ${items.length}`
                    : subject?.name)}
                {view === "result" && "Résultat"}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="size-8 grid place-items-center border border-line text-fog hover:border-ember hover:text-ember transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {configStep && error && (
            <ErrorBox message={error} onRetry={reload} />
          )}

          {configStep && !error && loading && <Loading />}

          {view === "subject" && !error && !loading && (
            <WizardStep title="Sur quoi veux-tu travailler ?">
              {subjects.map((o) => (
                <WizardCard
                  key={o.subject}
                  icon={<PracticeIcon name={o.subject} />}
                  glyph={SUBJECT_JP[o.subject] ?? "練習"}
                  label={o.name}
                  onClick={() => {
                    setSubjectUid(o.subject)
                    setMode(null)
                    setStep("mode")
                  }}
                />
              ))}
            </WizardStep>
          )}

          {view === "mode" && subject && !error && !loading && (
            <WizardStep
              title="Dans quel sens ?"
              onBack={() => setStep("subject")}
            >
              {subject.modes.map((o) => (
                <WizardCard
                  key={o.name}
                  icon={<span className="jp text-xl whitespace-nowrap">{modeJp(o)}</span>}
                  label={o.name}
                  onClick={() => {
                    setMode(o)
                    setStep("focus")
                  }}
                />
              ))}
            </WizardStep>
          )}

          {view === "focus" && subject && !error && !loading && (
            <WizardStep
              title="Sur quoi veux-tu te concentrer ?"
              onBack={() => setStep("mode")}
            >
              {subject.focus.map((o) => (
                <WizardCard
                  key={o.focus}
                  icon={<PracticeIcon name={o.focus} />}
                  label={o.name}
                  onClick={() => start(o)}
                />
              ))}
            </WizardStep>
          )}

          {view === "quiz" && quizLoading && <Loading />}

          {view === "quiz" && !quizLoading && quizError && (
            <div className="space-y-4">
              <ErrorBox message={quizError} onRetry={() => start(focus!)} />
              <button
                onClick={() => setStep("focus")}
                className="mono text-[11px] uppercase tracking-[0.12em] text-fog hover:text-ember transition-colors"
              >
                ← Changer de focus
              </button>
            </div>
          )}

          {view === "quiz" && item && question && (
            <div>
              {/* progress */}
              <div className="flex items-center gap-3 mb-8">
                <div className="h-1 flex-1 bg-line overflow-hidden">
                  <div
                    className="h-full bg-ember transition-all duration-300"
                    style={{ width: `${(idx / items.length) * 100}%` }}
                  />
                </div>
                <span className="mono text-[11px] text-fog">
                  {score} <span className="text-ember">★</span>
                </span>
              </div>

              <div className="text-center py-6 px-4 mb-6 border border-line bg-ink/40">
                <div className="mono text-[10px] uppercase tracking-[0.14em] text-fog mb-4">
                  {multiStage &&
                    `Étape ${stage + 1} / ${item.questions.length} · `}
                  {question.instructions}
                </div>
                <JpText value={item} size="prompt" />
                {/* réponses des étapes précédentes */}
                {item.questions.slice(0, stage).map((q, i) => {
                  const answer = q.propositions.find((p) => isCorrect(item, p))
                  return (
                    answer && (
                      <div key={i} className="mt-3 text-ember">
                        <JpText value={answer} size="answer" />
                      </div>
                    )
                  )
                })}
              </div>

              {!revealed ? (
                <div className="text-center">
                  <p className="mono text-[11px] text-fog uppercase tracking-[0.1em] mb-4">
                    Cherche la réponse de mémoire, puis affiche les
                    propositions.
                  </p>
                  <button
                    onClick={() => setRevealed(true)}
                    className="mono text-sm uppercase tracking-[0.1em] w-full py-3.5 border border-ember text-ember font-600 hover:bg-ember hover:text-ink transition-colors"
                  >
                    Prêt à répondre ! →
                  </button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3">
                  {question.propositions.map((opt, i) => {
                    const isAnswer = isCorrect(item, opt)
                    const isPicked = i === picked
                    let cls = "border-line hover:border-ember bg-ink/40"
                    if (picked != null) {
                      if (isAnswer)
                        cls =
                          "border-emerald-500 bg-emerald-500/10 text-emerald-300"
                      else if (isPicked)
                        cls = "border-red-500 bg-red-500/10 text-red-300"
                      else cls = "border-line opacity-40"
                    }
                    return (
                      <button
                        key={`${opt.id}-${i}`}
                        onClick={() => pick(i)}
                        disabled={picked != null}
                        className={
                          "border p-4 text-center transition-colors " + cls
                        }
                      >
                        <JpText value={opt} size="option" />
                      </button>
                    )
                  })}
                </div>
              )}

              {pickedProp && (
                <button
                  onClick={next}
                  className="mono text-sm uppercase tracking-[0.1em] w-full mt-6 py-3.5 bg-ember text-ink font-600 hover:bg-ember-soft transition-colors"
                >
                  {stage + 1 < item.questions.length
                    ? "Étape suivante"
                    : idx + 1 >= items.length
                      ? "Voir mon score"
                      : "Question suivante"}{" "}
                  →
                </button>
              )}
            </div>
          )}

          {view === "result" && (
            <div className="text-center py-6">
              <div className="mono text-[11px] uppercase tracking-[0.16em] text-ember mb-4">
                {resultMessage(score, items.length).tag}
              </div>
              <div className="jp text-5xl mb-2">
                {resultMessage(score, items.length).jp}
              </div>
              <div className="display font-900 text-7xl tracking-tight my-4">
                {score}
                <span className="text-fog text-3xl">/{items.length}</span>
              </div>
              <div className="mono text-sm text-fog mb-4">
                {Math.round((score / items.length) * 100)}% de réussite
              </div>

              {save && (
                <div
                  className={
                    "mono text-[11px] uppercase tracking-[0.1em] mb-4 " +
                    (save.state === "error" ? "text-ember" : "text-fog")
                  }
                >
                  {save.state === "saving" && "Enregistrement de ta progression…"}
                  {save.state === "saved" &&
                    (save.skipped
                      ? `Progression enregistrée · ${save.skipped} élément${save.skipped > 1 ? "s" : ""} non suivi${save.skipped > 1 ? "s" : ""}`
                      : "Progression enregistrée")}
                  {save.state === "error" && save.error}
                </div>
              )}

              {/* score bar */}
              <div className="h-2 bg-line overflow-hidden mb-10 max-w-sm mx-auto">
                <div
                  className="h-full bg-ember transition-all duration-700"
                  style={{ width: `${(score / items.length) * 100}%` }}
                />
              </div>

              <div className="flex gap-3 max-w-sm mx-auto">
                <button
                  onClick={reset}
                  className="mono text-xs uppercase tracking-[0.1em] flex-1 py-3 border border-line text-fog hover:border-ember hover:text-ember transition-colors"
                >
                  Nouvel exercice
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
      </div>
    </div>
  )
}

/** `text`, avec sa lecture en plus petit au-dessus quand elle est fournie. */
function JpText({
  value,
  size,
}: {
  value: TrainingText
  size: "prompt" | "answer" | "option"
}) {
  const jp = isJp(value.text)
  const textCls = {
    prompt: jp ? "jp text-5xl" : "display font-800 text-3xl",
    answer: jp ? "jp text-2xl" : "text-lg",
    option: jp ? "jp text-2xl" : "text-base",
  }[size]
  const readingCls = {
    prompt: "text-base",
    answer: "text-xs",
    option: "text-xs",
  }[size]
  return (
    <span className="flex flex-col items-center">
      {value.reading && (
        <span className={"jp opacity-70 mb-1 " + readingCls}>
          {value.reading}
        </span>
      )}
      <span className={textCls}>{value.text}</span>
    </span>
  )
}

function Loading() {
  return (
    <p className="mono text-xs text-fog uppercase tracking-[0.12em] text-center py-12">
      Chargement…
    </p>
  )
}

function ErrorBox({
  message,
  onRetry,
}: {
  message: string
  onRetry: () => void
}) {
  return (
    <div
      role="alert"
      className="border border-ember/40 bg-ember/5 px-4 py-6 flex flex-col items-center gap-3 text-center"
    >
      <p className="mono text-xs text-ember">{message}</p>
      <button
        onClick={onRetry}
        className="mono text-xs uppercase tracking-[0.1em] text-ember hover:text-ember-soft underline underline-offset-4"
      >
        Réessayer
      </button>
    </div>
  )
}

function WizardStep({
  title,
  onBack,
  children,
}: {
  title: string
  onBack?: () => void
  children: ReactNode
}) {
  return (
    <div>
      {onBack && (
        <button
          onClick={onBack}
          className="mono text-[11px] uppercase tracking-[0.12em] text-fog hover:text-ember transition-colors mb-4"
        >
          ← Retour
        </button>
      )}
      <h2 className="display text-2xl font-800 mb-5">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>
    </div>
  )
}

/** Carte de choix de l'assistant : icône, intitulé, glyphe décoratif. */
function WizardCard({
  icon,
  label,
  glyph,
  onClick,
}: {
  icon: ReactNode
  label: string
  /** Glyphe japonais en filigrane. */
  glyph?: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="group relative overflow-hidden text-left w-full border border-line bg-ink/40 p-4 flex items-center gap-4 transition-all duration-150 hover:border-ember hover:bg-ember/5 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:border-ember"
    >
      <span className="absolute inset-x-0 top-0 h-0.5 bg-ember opacity-0 group-hover:opacity-100 transition-opacity" />
      {glyph && (
        <span
          aria-hidden
          className="jp absolute -right-1 -bottom-3 text-6xl font-900 text-chalk/[0.04] group-hover:text-ember/10 transition-colors pointer-events-none select-none"
        >
          {glyph}
        </span>
      )}
      <span className="min-w-16 h-16 px-3 shrink-0 grid place-items-center border border-line-bright bg-panel-2 text-ember group-hover:border-ember transition-colors">
        {icon}
      </span>
      <span className="relative flex-1 flex items-center justify-between gap-3">
        <span className="text-base font-500 leading-snug">{label}</span>
        <span className="text-ember shrink-0 transition-transform group-hover:translate-x-1">→</span>
      </span>
    </button>
  )
}
