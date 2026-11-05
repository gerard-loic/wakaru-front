import { useEffect, useState } from "react"
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useNavigate,
  useOutletContext,
  useParams,
} from "react-router-dom"
import { sylo } from "@/lib/sylo"
import { useReloadOn } from "@/lib/useReloadOn"
import { AppLayout, type AppLayoutContext } from "@/layout/AppLayout"
import { useItemStatsRemote } from "@/layout/useItemStats"
import { AuthScreen } from "@/features/auth/AuthScreen"
import { RegisterScreen } from "@/features/auth/RegisterScreen"
import ForgotPasswordScreen from "@/features/auth/ForgotPasswordScreen"
import ResetPasswordScreen from "@/features/auth/ResetPasswordScreen"
import { TermsScreen } from "@/features/legal/TermsScreen"
import { DashboardView } from "@/features/dashboard/DashboardView"
import { VocabView } from "@/features/vocab/VocabView"
import { useWords } from "@/features/vocab/useWords"
import { KanaView } from "@/features/kana/KanaView"
import { useKanas } from "@/features/kana/useKanas"
import { ThemesView } from "@/features/themes/ThemesView"
import { useLatestTheme, useThemes } from "@/features/themes/useThemes"
import { useTheme } from "@/features/themes/useTheme"
import { ThemeDetail } from "@/features/themes/ThemeDetail"
import { KanjiView } from "@/features/kanji/KanjiView"
import { useKanjis } from "@/features/kanji/useKanjis"
import { GrammarView } from "@/features/grammar/GrammarView"
import { useRules } from "@/features/grammar/useRules"
import { ExercisesView } from "@/features/exercises/ExercisesView"
import { ExerciseDetail } from "@/features/exercises/ExerciseDetail"
import { useExercises } from "@/features/exercises/useExercises"
import { useExercise } from "@/features/exercises/useExercise"
import { SentencesView } from "@/features/sentences/SentencesView"
import { useSentences } from "@/features/sentences/useSentences"
import BlackboardView from "@/features/blackboard/BlackboardView"

export default function App() {
  const [authed, setAuthed] = useState(() => sylo.isAuthenticated)

  // Redirige automatiquement vers l'écran d'auth si le token expire ou si une
  // requête renvoie 401 (SyloConnector efface alors la session côté client).
  useEffect(() => sylo.onAuthChange(setAuthed), [])

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            authed ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <AuthScreen onEnter={() => setAuthed(true)} />
            )
          }
        />
        <Route
          path="/register"
          element={
            authed ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <RegisterScreen onEnter={() => setAuthed(true)} />
            )
          }
        />
        <Route
          path="/forgot-password"
          element={
            authed ? <Navigate to="/dashboard" replace /> : <ForgotPasswordScreen />
          }
        />
        {/* Accessible même connecté : le lien reçu par e-mail doit toujours aboutir. */}
        <Route path="/reset-password" element={<ResetPasswordScreen />} />
        <Route path="/cgu" element={<TermsScreen />} />
        <Route
          element={authed ? <AppLayout /> : <Navigate to="/login" replace />}
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardRoute />} />
          <Route path="vocab" element={<VocabRoute />} />
          <Route path="hiragana" element={<HiraganaRoute />} />
          <Route path="katakana" element={<KatakanaRoute />} />
          <Route path="themes" element={<ThemesRoute />} />
          <Route path="themes/:id" element={<ThemeDetailRoute />} />
          <Route path="kanji" element={<KanjiRoute />} />
          <Route path="kanji/:id" element={<KanjiDetailRoute />} />
          <Route path="grammar" element={<GrammarRoute />} />
          <Route path="grammar/:id" element={<RuleDetailRoute />} />
          <Route path="exercises" element={<ExercisesRoute />} />
          <Route path="exercises/:id" element={<ExerciseDetailRoute />} />
          <Route path="sentences" element={<SentencesRoute />} />
          <Route path="blackboard" element={<BlackboardView />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

function DashboardRoute() {
  const navigate = useNavigate()
  const { runExercise, runTraining, user, knowledgeVersion } =
    useOutletContext<AppLayoutContext>()
  const weeklyTheme = useLatestTheme()
  const itemStats = useItemStatsRemote()
  useReloadOn(knowledgeVersion, itemStats.reload)
  useReloadOn(knowledgeVersion, weeklyTheme.reload)
  return (
    <DashboardView
      firstName={user?.firstName}
      weeklyTheme={weeklyTheme}
      itemStats={itemStats}
      onOpenTheme={(id) => navigate(`/themes/${id}`)}
      onExercise={runExercise}
      onTraining={runTraining}
    />
  )
}

function VocabRoute() {
  const { openPractice, canPractice, openWord, knowledgeVersion } =
    useOutletContext<AppLayoutContext>()
  const vocab = useWords()
  useReloadOn(knowledgeVersion, vocab.reload)
  return (
    <VocabView
      words={vocab.words}
      loading={vocab.loading}
      error={vocab.error}
      onRetry={vocab.reload}
      pagination={vocab.pagination}
      query={vocab.query}
      onQueryChange={vocab.setQuery}
      pos={vocab.pos}
      onPosChange={vocab.setPos}
      theme={vocab.theme}
      onThemeChange={vocab.setTheme}
      themes={vocab.themes}
      mastery={vocab.mastery}
      onMasteryChange={vocab.setMastery}
      partsOfSpeech={vocab.partsOfSpeech}
      onOpen={openWord}
      onExercise={
        canPractice("vocab") ? () => openPractice("vocab") : undefined
      }
    />
  )
}

function HiraganaRoute() {
  const { openPractice, canPractice } = useOutletContext<AppLayoutContext>()
  const kanas = useKanas("hiragana")
  return (
    <KanaView
      title="Hiragana"
      jp="ひらがな"
      sections={kanas.sections}
      total={kanas.total}
      counts={kanas.counts}
      mastery={kanas.mastery}
      onMasteryChange={kanas.setMastery}
      loading={kanas.loading}
      error={kanas.error}
      onRetry={kanas.reload}
      onExercise={
        canPractice("hiragana") ? () => openPractice("hiragana") : undefined
      }
    />
  )
}

function KatakanaRoute() {
  const { openPractice, canPractice } = useOutletContext<AppLayoutContext>()
  const kanas = useKanas("katakana")
  return (
    <KanaView
      title="Katakana"
      jp="カタカナ"
      sections={kanas.sections}
      total={kanas.total}
      counts={kanas.counts}
      mastery={kanas.mastery}
      onMasteryChange={kanas.setMastery}
      loading={kanas.loading}
      error={kanas.error}
      onRetry={kanas.reload}
      onExercise={
        canPractice("katakana") ? () => openPractice("katakana") : undefined
      }
    />
  )
}

function ThemesRoute() {
  const navigate = useNavigate()
  const list = useThemes()
  return (
    <ThemesView
      themes={list.data}
      loading={list.loading}
      error={list.error}
      onRetry={list.reload}
      onOpen={(id) => navigate(`/themes/${id}`)}
    />
  )
}

function ThemeDetailRoute() {
  const { id } = useParams<{ id: string }>()
  const themeId = Number(id)
  if (!Number.isInteger(themeId)) return <Navigate to="/themes" replace />
  return <ThemeDetailLoader id={themeId} />
}

function ThemeDetailLoader({ id }: { id: number }) {
  const navigate = useNavigate()
  const {
    openWord,
    openKanji,
    openRule,
    openSentence,
    runExercise,
    runTraining,
    knowledgeVersion,
  } = useOutletContext<AppLayoutContext>()
  const detail = useTheme(id)
  const latest = useLatestTheme()
  useReloadOn(knowledgeVersion, detail.reload)
  return (
    <ThemeDetail
      isWeekly={latest.status === "ready" ? latest.data?.id === id : null}
      content={detail.data}
      loading={detail.loading}
      error={detail.error}
      onRetry={detail.reload}
      onBack={() => navigate("/themes")}
      onOpenWord={openWord}
      onOpenKanji={openKanji}
      onOpenRule={openRule}
      onOpenSentence={openSentence}
      onOpenExercise={(eid) => navigate(`/exercises/${eid}`)}
      onRunExercise={runExercise}
      onRunTraining={runTraining}
    />
  )
}

function KanjiRoute() {
  const { openPractice, canPractice, openKanji } =
    useOutletContext<AppLayoutContext>()
  const list = useKanjis()
  return (
    <KanjiView
      kanjis={list.kanjis}
      loading={list.loading}
      error={list.error}
      onRetry={list.reload}
      pagination={list.pagination}
      query={list.query}
      onQueryChange={list.setQuery}
      theme={list.theme}
      onThemeChange={list.setTheme}
      themes={list.themes}
      mastery={list.mastery}
      onMasteryChange={list.setMastery}
      onOpen={openKanji}
      onExercise={
        canPractice("kanji") ? () => openPractice("kanji") : undefined
      }
    />
  )
}

/** Ancienne URL de détail : redirige vers la liste avec la popin ouverte. */
function KanjiDetailRoute() {
  const { id } = useParams<{ id: string }>()
  return <Navigate to={`/kanji?kanji=${encodeURIComponent(id ?? "")}`} replace />
}

function GrammarRoute() {
  const { openRule, knowledgeVersion } = useOutletContext<AppLayoutContext>()
  const list = useRules()
  useReloadOn(knowledgeVersion, list.reload)
  return (
    <GrammarView
      rules={list.rules}
      loading={list.loading}
      error={list.error}
      onRetry={list.reload}
      pagination={list.pagination}
      query={list.query}
      onQueryChange={list.setQuery}
      category={list.category}
      onCategoryChange={list.setCategory}
      theme={list.theme}
      onThemeChange={list.setTheme}
      categories={list.categories}
      themes={list.themes}
      onOpen={openRule}
    />
  )
}

/** Ancienne URL de détail : redirige vers la liste avec la popin ouverte. */
function RuleDetailRoute() {
  const { id } = useParams<{ id: string }>()
  return <Navigate to={`/grammar?rule=${encodeURIComponent(id ?? "")}`} replace />
}

function ExercisesRoute() {
  const navigate = useNavigate()
  const { runExercise, knowledgeVersion } = useOutletContext<AppLayoutContext>()
  const list = useExercises()
  useReloadOn(knowledgeVersion, list.reload)
  return (
    <ExercisesView
      exercises={list.exercises}
      loading={list.loading}
      error={list.error}
      onRetry={list.reload}
      pagination={list.pagination}
      query={list.query}
      onQueryChange={list.setQuery}
      category={list.category}
      onCategoryChange={list.setCategory}
      theme={list.theme}
      onThemeChange={list.setTheme}
      mastery={list.mastery}
      onMasteryChange={list.setMastery}
      categories={list.categories}
      themes={list.themes}
      onOpen={(id) => navigate(`/exercises/${id}`)}
      onRun={runExercise}
    />
  )
}

function ExerciseDetailRoute() {
  const { id } = useParams<{ id: string }>()
  const exerciseId = Number(id)
  if (!Number.isInteger(exerciseId)) return <Navigate to="/exercises" replace />
  return <ExerciseDetailLoader id={exerciseId} />
}

function ExerciseDetailLoader({ id }: { id: number }) {
  const navigate = useNavigate()
  const { runExercise, knowledgeVersion } = useOutletContext<AppLayoutContext>()
  const { data, loading, error, reload } = useExercise(id)
  useReloadOn(knowledgeVersion, reload)
  return (
    <ExerciseDetail
      // Pendant le passage d'un exercice à l'autre, n'affiche pas l'ancien.
      detail={data?.exercise.id === id ? data : null}
      loading={loading}
      error={error}
      onRetry={reload}
      onBack={() => navigate("/exercises")}
      onRun={runExercise}
    />
  )
}

function SentencesRoute() {
  const { openPractice, canPractice, openSentence } =
    useOutletContext<AppLayoutContext>()
  const list = useSentences()
  return (
    <SentencesView
      sentences={list.sentences}
      loading={list.loading}
      error={list.error}
      onRetry={list.reload}
      pagination={list.pagination}
      query={list.query}
      onQueryChange={list.setQuery}
      theme={list.theme}
      onThemeChange={list.setTheme}
      mastery={list.mastery}
      onMasteryChange={list.setMastery}
      themes={list.themes}
      onOpen={openSentence}
      onExercise={
        canPractice("sentences") ? () => openPractice("sentences") : undefined
      }
    />
  )
}
