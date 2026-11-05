import { useRef, useState } from "react"
import { Outlet, useLocation, useNavigate, useSearchParams } from "react-router-dom"
import { markTaskDone } from "@/lib/knowledge"
import { TYPE_OPTS, type QType } from "@/lib/quiz"
import { sylo, syloErrorMessage } from "@/lib/sylo"
import { ExerciseRunner } from "@/features/exercises/ExerciseRunner"
import { useExercise } from "@/features/exercises/useExercise"
import { Practice } from "@/features/practice/Practice"
import {
  trainingFromParam,
  trainingToParam,
  type TrainingRequest,
} from "@/features/practice/training"
import {
  SUBJECT_BY_QTYPE,
  useTrainingConfiguration,
} from "@/features/practice/useTrainingConfiguration"
import { RuleModal } from "@/features/grammar/RuleModal"
import { useRule } from "@/features/grammar/useRule"
import { KanjiModal } from "@/features/kanji/KanjiModal"
import { SentenceModal } from "@/features/sentences/SentenceModal"
import { useSentence } from "@/features/sentences/useSentence"
import { useKanji } from "@/features/kanji/useKanji"
import {
  taskRefFromParam,
  taskRefToParam,
  type ProgramTaskRef,
} from "@/features/themes/themeProgram"
import { WordModal } from "@/features/vocab/WordModal"
import { useWord } from "@/features/vocab/useWord"
import { IconMenu } from "@/components/icons"
import { Logo } from "@/components/Logo"
import { Sidebar, type NavKey } from "@/layout/Sidebar"
import { useCurrentUser, type CurrentUser } from "@/layout/useCurrentUser"

const NAV_KEYS: NavKey[] = [
  "dashboard",
  "vocab",
  "hiragana",
  "katakana",
  "themes",
  "kanji",
  "grammar",
  "exercises",
  "sentences",
  "blackboard",
  "feedback",
]

function navKeyFromPath(pathname: string): NavKey {
  const seg = pathname.split("/")[1]
  return (NAV_KEYS as string[]).includes(seg) ? (seg as NavKey) : "dashboard"
}

const PRACTICE_TYPES = new Set<string>(["any", ...TYPE_OPTS.map((o) => o.id)])

function practiceTypeFromParam(value: string | null): QType | "any" | null {
  return value && PRACTICE_TYPES.has(value) ? (value as QType | "any") : null
}

/** Contexte exposé aux routes via `useOutletContext` : ouverture des overlays. */
export interface AppLayoutContext {
  /** Utilisateur connecté, `null` tant qu'il n'est pas chargé. */
  user: CurrentUser | null
  /**
   * Lance un exercice (`?run=<id>`) dans un overlay. `task` : tâche du
   * programme à marquer comme faite à la fin.
   */
  runExercise: (id: number, task?: ProgramTaskRef) => void
  /** Lance un entraînement préconfiguré (`?training=`) dans un overlay. */
  runTraining: (request: TrainingRequest, task?: ProgramTaskRef) => void
  /**
   * Incrémenté à chaque résultat d'exercice enregistré : les pages qui
   * affichent une maîtrise d'exercice se rechargent quand il change.
   */
  knowledgeVersion: number
  openPractice: (t: QType | "any") => void
  /**
   * Le sujet correspondant est proposé par `GET /training/configuration` :
   * sinon le bouton « M'exercer » de la page est masqué.
   */
  canPractice: (t: QType) => boolean
  /** Ouvre la popin de détail d'un mot (`?word=<id>`), par-dessus la page courante. */
  openWord: (id: number) => void
  /** Ouvre la popin de détail d'un kanji (`?kanji=<id>`), par-dessus la page courante. */
  openKanji: (id: number) => void
  /** Ouvre la popin de détail d'une règle (`?rule=<id>`), par-dessus la page courante. */
  openRule: (id: number) => void
  /** Ouvre la popin d'analyse d'une phrase (`?sentence=<id>`), par-dessus la page courante. */
  openSentence: (id: number) => void
}

/** Paramètres des popins de détail (une seule ouverte à la fois). */
const DETAIL_KEYS = ["word", "kanji", "rule", "sentence"] as const
type DetailKey = (typeof DETAIL_KEYS)[number]

/** `?word=<id>`, `?kanji=<id>`… -> id numérique, ou `null`. */
function idFromParam(value: string | null): number | null {
  const id = Number(value)
  return value && Number.isInteger(id) && id > 0 ? id : null
}

/**
 * Coquille commune aux pages authentifiées : sidebar + zone de contenu routée
 * (`Outlet`). La pratique et le lancement d'exercice restent des overlays
 * (pas de vraie page), mais leur état est porté par l'URL (`?practice=`,
 * `?training=`, `?run=`, `?word=`, `?kanji=`, `?rule=`, `?sentence=`) pour survivre à un rechargement et pouvoir être ouverts
 * depuis n'importe quelle page par un simple lien.
 */
export function AppLayout() {
  const [navOpen, setNavOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [knowledgeVersion, setKnowledgeVersion] = useState(0)
  const [taskError, setTaskError] = useState<string | null>(null)
  const { subjects: practiceSubjects } = useTrainingConfiguration()
  const { user, reload: reloadUser } = useCurrentUser()

  const practiceParam = practiceTypeFromParam(searchParams.get("practice"))
  const trainingPreset = trainingFromParam(searchParams.get("training"))
  const taskRef = taskRefFromParam(searchParams.get("task"))
  const runId = idFromParam(searchParams.get("run"))
  const wordId = idFromParam(searchParams.get("word"))
  const kanjiId = idFromParam(searchParams.get("kanji"))
  const ruleId = idFromParam(searchParams.get("rule"))
  const sentenceId = idFromParam(searchParams.get("sentence"))

  /** Pose (`string`) ou retire (`null`) des paramètres d'overlay, en une entrée d'historique. */
  const setOverlay = (changes: Record<string, string | null>) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      for (const [key, value] of Object.entries(changes)) {
        if (value == null) next.delete(key)
        else next.set(key, value)
      }
      return next
    })
  }

  const openPractice = (t: QType | "any") => setOverlay({ practice: t })
  const closePractice = () =>
    setOverlay({ practice: null, training: null, task: null })
  const runTraining = (request: TrainingRequest, task?: ProgramTaskRef) =>
    setOverlay({
      training: trainingToParam(request),
      task: task ? taskRefToParam(task) : null,
    })
  const canPractice = (t: QType) =>
    practiceSubjects.some((s) => s.subject === SUBJECT_BY_QTYPE[t])
  const runExercise = (id: number, task?: ProgramTaskRef) =>
    setOverlay({ run: String(id), task: task ? taskRefToParam(task) : null })
  const closeRunner = () => setOverlay({ run: null, task: null })
  /**
   * Fin de l'overlay lancé depuis le programme : retirer `?task=` évite de
   * revalider la tâche sur « Recommencer » ou après un rechargement.
   */
  const finishTask = () => {
    if (!taskRef) return
    setOverlay({ task: null })
    markTaskDone(taskRef)
      .then(() => setKnowledgeVersion((v) => v + 1))
      .catch((err) => setTaskError(syloErrorMessage(err)))
  }
  // Détails mot / kanji / règle / phrase : un seul à la fois. Passer de l'un à
  // l'autre ajoute une entrée d'historique, donc « retour » rouvre le précédent.
  const openDetail = (key: DetailKey, id: number) =>
    setOverlay({
      ...Object.fromEntries(DETAIL_KEYS.map((k) => [k, null])),
      [key]: String(id),
    })
  const openWord = (id: number) => openDetail("word", id)
  const closeWord = () => setOverlay({ word: null })
  const openKanji = (id: number) => openDetail("kanji", id)
  const closeKanji = () => setOverlay({ kanji: null })
  const openRule = (id: number) => openDetail("rule", id)
  const closeRule = () => setOverlay({ rule: null })
  const openSentence = (id: number) => openDetail("sentence", id)
  const closeSentence = () => setOverlay({ sentence: null })

  const context: AppLayoutContext = {
    user,
    runExercise,
    runTraining,
    knowledgeVersion,
    openPractice,
    canPractice,
    openWord,
    openKanji,
    openRule,
    openSentence,
  }

  return (
    <div className="h-dvh flex bg-ink text-chalk">
      <Sidebar
        active={navKeyFromPath(location.pathname)}
        user={user}
        knowledgeVersion={knowledgeVersion}
        open={navOpen}
        onClose={() => setNavOpen(false)}
        returnFocusRef={menuButtonRef}
        onUserChange={reloadUser}
        onNav={(k) => {
          setNavOpen(false)
          navigate(`/${k}`)
        }}
        onLogout={() => sylo.logout()}
        onPractice={() => {
          setNavOpen(false)
          openPractice("any")
        }}
      />
      {/* `inert` : le contenu derrière le tiroir ouvert ne reçoit plus le focus. */}
      <div inert={navOpen} className="flex-1 min-w-0 flex flex-col">
        <header className="lg:hidden shrink-0 h-14 px-2 flex items-center gap-1 bg-panel border-b border-line">
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setNavOpen(true)}
            aria-label="Ouvrir le menu"
            aria-expanded={navOpen}
            className="size-10 grid place-items-center text-fog hover:text-ember transition-colors"
          >
            <IconMenu />
          </button>
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            aria-label="Tableau de bord"
            className="block transition-opacity hover:opacity-80"
          >
            <Logo size="sm" />
          </button>
        </header>
        <main className="flex-1 min-h-0 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <Outlet context={context} />
          </div>
        </main>
      </div>
      {(practiceParam || trainingPreset) && (
        <Practice
          initialType={
            !practiceParam || practiceParam === "any" ? undefined : practiceParam
          }
          preset={trainingPreset ?? undefined}
          onRecorded={() => setKnowledgeVersion((v) => v + 1)}
          onFinished={finishTask}
          onClose={closePractice}
        />
      )}
      {runId != null && (
        <RunnerOverlay
          id={runId}
          onRecorded={() => setKnowledgeVersion((v) => v + 1)}
          onFinished={finishTask}
          onClose={closeRunner}
        />
      )}
      {wordId != null && (
        <WordOverlay
          id={wordId}
          onRead={() => setKnowledgeVersion((v) => v + 1)}
          onOpenKanji={openKanji}
          onClose={closeWord}
        />
      )}
      {kanjiId != null && (
        <KanjiOverlay
          id={kanjiId}
          onOpenWord={openWord}
          onClose={closeKanji}
        />
      )}
      {ruleId != null && (
        <RuleOverlay
          id={ruleId}
          onRead={() => setKnowledgeVersion((v) => v + 1)}
          onClose={closeRule}
        />
      )}
      {sentenceId != null && (
        <SentenceOverlay
          id={sentenceId}
          onOpenWord={openWord}
          onClose={closeSentence}
        />
      )}
      {taskError && (
        <div
          role="alert"
          className="fixed bottom-4 left-4 right-4 sm:left-auto z-60 sm:max-w-sm border border-ember/40 bg-panel px-4 py-3 flex items-start gap-3"
        >
          <p className="mono text-xs text-ember">
            Tâche non validée : {taskError}
          </p>
          <button
            onClick={() => setTaskError(null)}
            aria-label="Fermer"
            className="text-fog hover:text-ember transition-colors"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  )
}

/** Glue `useExercise` -> `ExerciseRunner`. */
function RunnerOverlay({
  id,
  onRecorded,
  onFinished,
  onClose,
}: {
  id: number
  onRecorded: () => void
  onFinished: () => void
  onClose: () => void
}) {
  const { data, loading, error, reload } = useExercise(id)
  return (
    <ExerciseRunner
      // Pendant le passage d'un exercice à l'autre, n'affiche pas l'ancien.
      detail={data?.exercise.id === id ? data : null}
      loading={loading}
      error={error}
      onRetry={reload}
      onRecorded={onRecorded}
      onFinished={onFinished}
      onClose={onClose}
    />
  )
}

/** Glue `useWord` -> `WordModal`. */
function WordOverlay({
  id,
  onRead,
  onOpenKanji,
  onClose,
}: {
  id: number
  /** Appelé quand le mot vient d'être marqué comme lu. */
  onRead: () => void
  onOpenKanji: (kanjiId: number) => void
  onClose: () => void
}) {
  const { detail, loading, error, reload } = useWord(id, onRead)
  // Pendant le passage d'un mot à l'autre, n'affiche pas l'ancien.
  const current = detail?.word.id === id ? detail : null
  return (
    <WordModal
      // Chaque mot repart sur son premier onglet.
      key={id}
      word={current?.word ?? null}
      composition={current?.composition}
      conjugation={current?.conjugation}
      onOpenKanji={onOpenKanji}
      loading={loading}
      error={error}
      onRetry={reload}
      onClose={onClose}
    />
  )
}

/** Glue `useKanji` -> `KanjiModal`. */
function KanjiOverlay({
  id,
  onOpenWord,
  onClose,
}: {
  id: number
  onOpenWord: (wordId: number) => void
  onClose: () => void
}) {
  const { detail, loading, error, reload } = useKanji(id)
  return (
    <KanjiModal
      // Pendant le passage d'un kanji à l'autre, n'affiche pas l'ancien.
      detail={detail?.kanji.id === id ? detail : null}
      loading={loading}
      error={error}
      onRetry={reload}
      onOpenWord={onOpenWord}
      onClose={onClose}
    />
  )
}

/** Glue `useRule` -> `RuleModal`. */
function RuleOverlay({
  id,
  onRead,
  onClose,
}: {
  id: number
  /** Appelé quand la règle vient d'être marquée comme lue. */
  onRead: () => void
  onClose: () => void
}) {
  const { rule, loading, error, reload } = useRule(id, onRead)
  return (
    <RuleModal
      // Pendant le passage d'une règle à l'autre, n'affiche pas l'ancienne.
      rule={rule?.id === id ? rule : null}
      loading={loading}
      error={error}
      onRetry={reload}
      onClose={onClose}
    />
  )
}

/** Glue `useSentence` -> `SentenceModal`. */
function SentenceOverlay({
  id,
  onOpenWord,
  onClose,
}: {
  id: number
  onOpenWord: (wordId: number) => void
  onClose: () => void
}) {
  const { detail, loading, error, reload } = useSentence(id)
  return (
    <SentenceModal
      // Pendant le passage d'une phrase à l'autre, n'affiche pas l'ancienne.
      detail={detail?.sentence.id === id ? detail : null}
      loading={loading}
      error={error}
      onRetry={reload}
      onOpenWord={onOpenWord}
      onClose={onClose}
    />
  )
}
